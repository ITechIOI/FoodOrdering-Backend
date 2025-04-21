import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'ioredis';

@Injectable()
export class CacheService {
  private redisClient: Redis.Redis | null = null;
  private readonly redisEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.redisEnabled = this.configService.get<boolean>('REDIS_ENABLE', false);

    if (this.redisEnabled) {
      this.redisClient = new Redis.default({
        host: this.configService.get<string>('REDIS_HOST'),
        port: this.configService.get<number>('REDIS_PORT'),
        username: this.configService.get<string>('REDIS_USERNAME'),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        db: this.configService.get<number>('REDIS_DB'),
        lazyConnect: true,
        enableReadyCheck: true,
      });

      this.redisClient.on('error', () => {
        console.error('Redis connection error');
      });
    }
  }

  async getCache(key: string): Promise<string | null> {
    if (!this.redisEnabled || !this.redisClient) return null;
    return await this.redisClient.get(key);
  }

  async setCache(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.redisEnabled || !this.redisClient) return;
    await this.redisClient.set(
      key,
      value,
      'EX',
      ttl || this.configService.get<number>('REDIS_TTL')!,
    );
  }

  async deleteCache(key: string): Promise<void> {
    if (!this.redisEnabled || !this.redisClient) return;
    await this.redisClient.del(key);
  }

  async ttl(key: string): Promise<number | null> {
    if (!this.redisEnabled || !this.redisClient) return null;
    return await this.redisClient.ttl(key);
  }
}
