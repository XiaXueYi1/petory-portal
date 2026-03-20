import { Injectable } from '@nestjs/common';
import { DEV_ADMIN_PASSWORD, DEV_ADMIN_USERNAME } from '../auth.constants';
import type { AuthMenu, AuthProfile, AuthUserRecord } from '../auth.types';

const ADMIN_MENUS: AuthMenu[] = [
  {
    id: 'menu-system-dashboard',
    parentId: null,
    code: 'system-dashboard',
    name: 'System Home',
    path: '/',
    componentKey: 'DashboardPage',
    permissionCode: 'system:read',
    children: [],
  },
];

@Injectable()
export class AuthRepository {
  private readonly users = new Map<string, AuthUserRecord>();

  constructor() {
    const adminUser: AuthUserRecord = {
      id: 'user-admin-local',
      username: DEV_ADMIN_USERNAME,
      password: DEV_ADMIN_PASSWORD,
      nickname: 'Super Admin',
      avatar: '',
      email: 'admin@local.petory.dev',
      roles: ['admin'],
      permissions: [
        'auth:login',
        'auth:profile',
        'system:read',
        'users:manage',
      ],
      menus: ADMIN_MENUS,
    };

    this.users.set(adminUser.username, adminUser);
  }

  findUserByUsername(username: string): AuthUserRecord | undefined {
    return this.users.get(username);
  }

  findUserById(userId: string): AuthUserRecord | undefined {
    return [...this.users.values()].find((user) => user.id === userId);
  }

  toProfile(user: AuthUserRecord): AuthProfile {
    return {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email,
      },
      roles: user.roles,
      permissions: user.permissions,
      menus: user.menus,
    };
  }
}
