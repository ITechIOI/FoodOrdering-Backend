import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { Type } from 'class-transformer';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RolesModule,
    JwtModule,
    CloudinaryModule,
  ],
  providers: [UsersResolver, UsersService, AuthGuard, CloudinaryService],
  exports: [UsersService],
})
export class UsersModule {}
