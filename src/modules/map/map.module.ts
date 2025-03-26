import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapResolver } from './map.resolver';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [MapResolver, MapService, ConfigService],
})
export class MapModule {}
