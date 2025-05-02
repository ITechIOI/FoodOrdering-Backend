import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteResolver } from './favorite.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from 'src/entities/favorite.entity';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorite]),
    RestaurantModule,
    UsersModule,
  ],
  providers: [FavoriteResolver, FavoriteService],
  exports: [FavoriteService],
})
export class FavoriteModule {}
