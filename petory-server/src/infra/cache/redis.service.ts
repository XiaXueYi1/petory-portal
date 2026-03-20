import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
      port: Number(this.configService.get<string>('REDIS_PORT', '6379')),
      db: Number(this.configService.get<string>('REDIS_DB', '0')),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
  }

  async onModuleInit(): Promise<void> {
    if (this.client.status === 'wait') {
      await this.client.connect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== 'end') {
      await this.client.quit();
    }
  }

  async setJson(
    key: string,
    value: unknown,
    ttlSeconds: number,
  ): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
