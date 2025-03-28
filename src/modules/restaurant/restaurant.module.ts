import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantResolver } from './restaurant.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/entities/restaurant.entity';
import { Address } from 'src/entities/address.entity';
import { User } from 'src/entities/user.entity';
import { AddressModule } from '../address/address.module';
import { UsersModule } from '../users/users.module';
import { CacheService } from 'src/common/cache/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant]), AddressModule, UsersModule],
  providers: [RestaurantResolver, RestaurantService, CacheService],
  exports: [RestaurantService],
})
export class RestaurantModule {}
