import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import {
  AuthProvider,
  MenuStatus,
  PermissionStatus,
  Prisma,
  RoleStatus,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '@/infra/database';
import type {
  AuthMenu,
  AuthProfile,
  AuthSubjectRecord,
} from '@/modules/auth/auth.types';

const userGraphInclude = Prisma.validator<Prisma.UserInclude>()({
  authIdentities: true,
  userRoles: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          roleMenus: {
            include: {
              menu: true,
            },
          },
        },
      },
    },
  },
});

type UserWithAuthGraph = Prisma.UserGetPayload<{
  include: typeof userGraphInclude;
}>;

type MenuNodeDraft = Omit<AuthMenu, 'children'> & {
  sort: number;
  children: MenuNodeDraft[];
};

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPasswordUserByPhone(
    phone: string,
  ): Promise<AuthSubjectRecord | null> {
    const identity = await this.prisma.userAuthIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.WEB_PASSWORD,
          providerUserId: phone,
        },
      },
      include: {
        user: {
          include: userGraphInclude,
        },
      },
    });

    if (!identity) {
      return null;
    }

    return this.toAuthSubject(identity.user, identity.credentialHash);
  }

  async findUserById(userId: string): Promise<AuthSubjectRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: userGraphInclude,
    });

    if (!user) {
      return null;
    }

    const passwordIdentity = user.authIdentities.find(
      (identity) => identity.provider === AuthProvider.WEB_PASSWORD,
    );

    return this.toAuthSubject(user, passwordIdentity?.credentialHash ?? null);
  }

  async findWechatMiniUserByOpenId(
    openId: string,
  ): Promise<AuthSubjectRecord | null> {
    const identity = await this.prisma.userAuthIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.WECHAT_MINI_PROGRAM,
          providerUserId: openId,
        },
      },
      include: {
        user: {
          include: userGraphInclude,
        },
      },
    });

    if (!identity) {
      return null;
    }

    return this.toAuthSubject(identity.user, null);
  }

  async upsertWechatMiniPhoneUser(input: {
    openId: string;
    phoneNumber: string;
  }): Promise<AuthSubjectRecord> {
    const existingIdentity = await this.prisma.userAuthIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.WECHAT_MINI_PROGRAM,
          providerUserId: input.openId,
        },
      },
      include: {
        user: {
          include: userGraphInclude,
        },
      },
    });

    const existingUser = existingIdentity?.user
      ? existingIdentity.user
      : await this.prisma.user.findUnique({
          where: {
            phone: input.phoneNumber,
          },
          include: userGraphInclude,
        });

    const user =
      existingUser ??
      (await this.prisma.user.create({
        data: {
          phone: input.phoneNumber,
          nickname: this.buildWechatMiniNickname(input.phoneNumber),
          avatar: '',
          status: UserStatus.ACTIVE,
        },
        include: userGraphInclude,
      }));

    if (!user.phone) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          phone: input.phoneNumber,
        },
      });
    }

    await this.prisma.userAuthIdentity.upsert({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.WECHAT_MINI_PROGRAM,
          providerUserId: input.openId,
        },
      },
      update: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        provider: AuthProvider.WECHAT_MINI_PROGRAM,
        providerUserId: input.openId,
      },
    });

    const savedUser = await this.findUserById(user.id);

    if (!savedUser) {
      throw new Error('Failed to load WeChat mini user after login');
    }

    return savedUser;
  }

  async ensureWebPasswordIdentity(input: {
    userId: string;
    phone: string;
    passwordHash: string;
  }): Promise<void> {
    const existingIdentity = await this.prisma.userAuthIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.WEB_PASSWORD,
          providerUserId: input.phone,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (existingIdentity) {
      return;
    }

    await this.prisma.userAuthIdentity.create({
      data: {
        userId: input.userId,
        provider: AuthProvider.WEB_PASSWORD,
        providerUserId: input.phone,
        credentialHash: input.passwordHash,
      },
    });
  }

  async markUserLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async registerDevUser(input: {
    phone: string;
    passwordHash: string;
    nickname?: string;
    email?: string;
  }): Promise<AuthSubjectRecord> {
    const existingIdentity = await this.prisma.userAuthIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.WEB_PASSWORD,
          providerUserId: input.phone,
        },
      },
      include: {
        user: true,
      },
    });

    const existingUser =
      existingIdentity?.user ??
      (await this.prisma.user.findUnique({
        where: {
          phone: input.phone,
        },
      })) ??
      (input.email
        ? await this.prisma.user.findUnique({
            where: {
              email: input.email,
            },
          })
        : null);

    const user =
      existingUser ??
      (await this.prisma.user.create({
        data: {
          phone: input.phone,
          email: input.email ?? null,
          nickname: input.nickname?.trim() || input.phone,
          avatar: '',
          status: UserStatus.ACTIVE,
        },
      }));

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: input.email ?? user.email,
        phone: input.phone,
        nickname: input.nickname?.trim() || user.nickname || input.phone,
        status: UserStatus.ACTIVE,
      },
    });

    await this.prisma.userAuthIdentity.upsert({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.WEB_PASSWORD,
          providerUserId: input.phone,
        },
      },
      update: {
        userId: user.id,
        credentialHash: input.passwordHash,
      },
      create: {
        userId: user.id,
        provider: AuthProvider.WEB_PASSWORD,
        providerUserId: input.phone,
        credentialHash: input.passwordHash,
      },
    });

    const savedUser = await this.findUserById(user.id);

    if (!savedUser) {
      throw new Error('Failed to load development user after registration');
    }

    return savedUser;
  }

  toProfile(user: AuthSubjectRecord): AuthProfile {
    return {
      user: {
        id: user.userId,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email,
        phone: user.phone,
      },
      roles: user.roles,
      permissions: user.permissions,
      menus: user.menus,
    };
  }

  private toAuthSubject(
    user: UserWithAuthGraph,
    passwordHash: string | null,
  ): AuthSubjectRecord {
    const activeRoles = user.userRoles
      .map((item) => item.role)
      .filter((role) => role.status === RoleStatus.ACTIVE);

    const roles = [...new Set(activeRoles.map((role) => role.code))];
    const permissions = [
      ...new Set(
        activeRoles.flatMap((role) =>
          role.rolePermissions
            .map((item) => item.permission)
            .filter(
              (permission) => permission.status === PermissionStatus.ACTIVE,
            )
            .map((permission) => permission.code),
        ),
      ),
    ];

    const menus = this.buildMenuTree(
      activeRoles.flatMap((role) =>
        role.roleMenus
          .map((item) => item.menu)
          .filter((menu) => menu.status === MenuStatus.ACTIVE),
      ),
    );

    const username =
      user.authIdentities.find(
        (identity) => identity.provider === AuthProvider.WEB_PASSWORD,
      )?.providerUserId ??
      user.email ??
      user.phone ??
      user.id;

    return {
      userId: user.id,
      username,
      passwordHash,
      nickname: user.nickname,
      avatar: user.avatar ?? '',
      email: user.email,
      phone: user.phone,
      roles,
      permissions,
      menus,
      status: user.status === UserStatus.ACTIVE ? 'active' : 'disabled',
    };
  }

  private buildMenuTree(
    sourceMenus: Array<{
      id: string;
      parentId: string | null;
      code: string;
      name: string;
      path: string;
      componentKey: string;
      icon: string | null;
      sort: number;
      permissionCode: string | null;
    }>,
  ): AuthMenu[] {
    const draftMap = new Map<string, MenuNodeDraft>();

    sourceMenus.forEach((menu) => {
      if (!draftMap.has(menu.id)) {
        draftMap.set(menu.id, {
          id: menu.id,
          parentId: menu.parentId,
          code: menu.code,
          name: menu.name,
          path: menu.path,
          componentKey: menu.componentKey,
          icon: menu.icon,
          permissionCode: menu.permissionCode,
          sort: menu.sort,
          children: [],
        });
      }
    });

    const roots: MenuNodeDraft[] = [];

    draftMap.forEach((node) => {
      if (node.parentId && draftMap.has(node.parentId)) {
        draftMap.get(node.parentId)?.children.push(node);
        return;
      }

      roots.push(node);
    });

    return this.sortAndFinalizeMenus(roots);
  }

  private sortAndFinalizeMenus(nodes: MenuNodeDraft[]): AuthMenu[] {
    return [...nodes]
      .sort((left, right) => left.sort - right.sort)
      .map((node) => ({
        id: node.id,
        parentId: node.parentId,
        code: node.code,
        name: node.name,
        path: node.path,
        componentKey: node.componentKey,
        icon: node.icon,
        permissionCode: node.permissionCode,
        children: this.sortAndFinalizeMenus(node.children),
      }));
  }

  private buildWechatMiniNickname(phoneNumber: string): string {
    const suffix = randomBytes(2).toString('hex').toUpperCase();
    return `WeChat User${suffix}`;
  }
}
