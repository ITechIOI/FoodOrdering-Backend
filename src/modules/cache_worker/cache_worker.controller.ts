import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { User } from 'src/entities/user.entity';
import { CacheService } from 'src/common/cache/cache.service';

@Controller('cache')
export class CacheWorkerController {
  // private redis = new Redis();
  constructor(private readonly cacheService: CacheService) {}
  // @EventPattern('user.cache.set')
  // async handleUserCacheSet(@Payload() user: User) {
  //   // const cacheKey = `user:detail:${user.id}`;
  //   // console.log('user', user);
  //   // // await this.cacheManager.set(cacheKey, user, 30000);
  //   // await this.cacheManager.set(cacheKey, JSON.stringify(user), 30000);
  //   // console.log(`[CACHE] SET from MQ: ${cacheKey}`);

  //   const cacheKey = `user:detail:${1}`;
  //   const raw = await this.cacheService.getCache(cacheKey);
  //   console.log('MQ data', raw);
  //   if (raw) {
  //     console.log('[CACHE] HIT MQ:', cacheKey);
  //     return raw;
  //   }
  // }

  @EventPattern('user.cache.set')
  async handleSetCacheUserProfile(@Payload() message: string) {
    const user = JSON.parse(message);
    const cacheKey = `user:detail:${user.id}`;
    await this.cacheService.setCache(cacheKey, message, 3000);
    console.log(`[CACHE] SET from MQ: ${cacheKey}`);
  }

  @EventPattern('restaurant.cache.set')
  async handleSetRecommendedRestaurant(
    @Payload() message: { cacheKey: string; data: any },
  ) {
    try {
      const { cacheKey, data } = message;

      if (!cacheKey || !data || !Array.isArray(data)) {
        console.warn('[CACHE] Invalid cache set event received:', message);
        return;
      }

      console.log(`[CACHE] Setting cache for key: ${cacheKey}`);

      await this.cacheService.setCache(cacheKey, JSON.stringify(data), 3000);

      console.log(`[CACHE] Cache set successfully for key: ${cacheKey}`);
    } catch (error) {
      console.error('[CACHE] Error setting cache:', error);
    }
  }
}
