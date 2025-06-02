import { Module } from '@nestjs/common';
import { CacheWorkerController } from './cache_worker.controller';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { CacheService } from 'src/common/cache/cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: redisStore,
        host: 'redis-service',
        port: 6379,
        ttl: 6000,
      }),
    }),
  ],
  controllers: [CacheWorkerController],
  providers: [CacheService],
})
export class CacheWorkerModule {}
