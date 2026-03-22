import { AuthProvider } from '@prisma/client';
import type { PrismaService } from '@/infra/database';
import { AuthRepository } from '@/modules/auth/repository/auth.repository';

describe('AuthRepository', () => {
  it('upserts web password identity for mini-created users', async () => {
    const upsert = jest.fn();
    const prisma = {
      userAuthIdentity: {
        upsert,
      },
    } as unknown as PrismaService;

    const repository = new AuthRepository(prisma);

    await repository.ensureWebPasswordIdentity({
      userId: 'user-1',
      phone: '13800138000',
      passwordHash: 'salt.hash',
    });

    expect(upsert).toHaveBeenCalledWith({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.WEB_PASSWORD,
          providerUserId: '13800138000',
        },
      },
      update: {
        userId: 'user-1',
        credentialHash: 'salt.hash',
      },
      create: {
        userId: 'user-1',
        provider: AuthProvider.WEB_PASSWORD,
        providerUserId: '13800138000',
        credentialHash: 'salt.hash',
      },
    });
  });
});
