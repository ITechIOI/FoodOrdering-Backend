import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
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
    TypeOrmModule.forFeature([User]),
    RolesModule,
    JwtModule,
    CloudinaryModule,
  ],
  providers: [
    UsersResolver,
    UsersService,
    AuthGuard,
    CloudinaryService,
    CacheService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
