import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantResolver } from './restaurant.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/entities/restaurant.entity';
import { Address } from 'src/entities/address.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Address, User])],
  providers: [RestaurantResolver, RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {}
