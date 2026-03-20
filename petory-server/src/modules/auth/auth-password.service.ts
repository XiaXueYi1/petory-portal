import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

@Injectable()
export class AuthPasswordService {
  constructor(private readonly configService: ConfigService) {}

  hashPassword(
    password: string,
    salt = randomBytes(16).toString('base64url'),
  ): string {
    const digest = this.deriveDigest(password, salt);
    return `${salt}.${digest}`;
  }

  verifyPassword(password: string, storedHash: string): boolean {
    const [salt, expectedDigest] = storedHash.split('.');

    if (!salt || !expectedDigest) {
      return false;
    }

    const digest = this.deriveDigest(password, salt);
    const digestBuffer = Buffer.from(digest);
    const expectedBuffer = Buffer.from(expectedDigest);

    if (digestBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(digestBuffer, expectedBuffer);
  }

  private deriveDigest(password: string, salt: string): string {
    return scryptSync(
      password,
      `${salt}:${this.configService.getOrThrow<string>('AUTH_PASSWORD_PEPPER')}`,
      64,
    ).toString('base64url');
  }
}
