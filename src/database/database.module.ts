import { Module } from '@nestjs/common';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('MYSQL_HOST'),
        port: config.get<number>('MYSQL_PORT'),
        username: config.get<string>('MYSQL_USER'),
        password: config.get<string>('MYSQL_PASSWORD'),
        database: config.get<string>('MYSQL_DATABASE'),
        ssl: {
          ca: readFileSync(
            join(__dirname, '../../src', 'resources', 'ca.pem'),
          ).toString(),
        },
        entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
