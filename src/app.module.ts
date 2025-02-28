import { Module } from '@nestjs/common';
import { AppResolver } from './app.resolver';
import { DatabaseModule } from './database/database.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UsersModule } from './modules/users/users.module';
import { UsersResolver } from './modules/users/users.resolver';
import { AuthResolver } from './modules/auth/auth.resolver';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { ConfigModule } from '@nestjs/config';
import { GraphQLFormattedError } from 'graphql';
import { formatGraphQLError } from './common/interceptors/error.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schemas/schema.gql'),
      // autoSchemaFile: true,
      // Format response lỗi
      // formatError: (error: GraphQLFormattedError) => {
      //   const extensions = error.extensions || {};
      //   return {
      //     statusCode: (extensions['statusCode'] as number) || 500,
      //     message: error.message || 'Internal Server Error',
      //     data: null,
      //   };
      // },
      formatError: formatGraphQLError,
    }),

    DatabaseModule,
    UsersModule,
    AuthModule,
    RolesModule,
  ],
  providers: [AppResolver],
})
export class AppModule {}
