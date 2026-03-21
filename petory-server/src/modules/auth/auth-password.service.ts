import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

const WEB_PASSWORD_CIPHER_ALGORITHM = 'aes-256-gcm';
const WEB_PASSWORD_CIPHER_SEPARATOR = '.';

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

  decryptWebLoginPassword(password: string): string {
    if (!password.includes(WEB_PASSWORD_CIPHER_SEPARATOR)) {
      return password;
    }

    const [cipherTextBase64, authTagBase64] = password.split(
      WEB_PASSWORD_CIPHER_SEPARATOR,
    );

    if (!cipherTextBase64 || !authTagBase64) {
      throw new BadRequestException('Invalid encrypted password payload');
    }

    try {
      const decipher = createDecipheriv(
        WEB_PASSWORD_CIPHER_ALGORITHM,
        this.getRequiredCipherKey(),
        this.getRequiredCipherIv(),
      );

      decipher.setAuthTag(Buffer.from(authTagBase64, 'base64'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(cipherTextBase64, 'base64')),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch {
      return password;
    }
  }

  encryptWebLoginPassword(password: string): string {
    const cipher = createCipheriv(
      WEB_PASSWORD_CIPHER_ALGORITHM,
      this.getRequiredCipherKey(),
      this.getRequiredCipherIv(),
    );

    const encrypted = Buffer.concat([
      cipher.update(password, 'utf8'),
      cipher.final(),
    ]);

    return [
      encrypted.toString('base64'),
      cipher.getAuthTag().toString('base64'),
    ].join(WEB_PASSWORD_CIPHER_SEPARATOR);
  }

  private deriveDigest(password: string, salt: string): string {
    return scryptSync(
      password,
      `${salt}:${this.configService.getOrThrow<string>('AUTH_PASSWORD_PEPPER')}`,
      64,
    ).toString('base64url');
  }

  private getRequiredCipherKey(): Buffer {
    const value = this.configService.get<string>(
      'AUTH_WEB_PASSWORD_AES_KEY_BASE64',
    );

    if (!value) {
      throw new BadRequestException('Missing web password AES key');
    }

    return Buffer.from(value, 'base64');
  }

  private getRequiredCipherIv(): Buffer {
    const value = this.configService.get<string>(
      'AUTH_WEB_PASSWORD_AES_IV_BASE64',
    );

    if (!value) {
      throw new BadRequestException('Missing web password AES iv');
    }

    return Buffer.from(value, 'base64');
  }
}
