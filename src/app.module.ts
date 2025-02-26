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

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schemas/schema.gql'),
      // autoSchemaFile: true,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule
  ],
  providers: [AppResolver],
})
export class AppModule {}
