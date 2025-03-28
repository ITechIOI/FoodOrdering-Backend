import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuResolver } from './menu.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Menu } from 'src/entities/menu.entity';
import { CategoryModule } from '../category/category.module';
import { CacheService } from 'src/common/cache/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Menu]), CategoryModule],
  providers: [MenuResolver, MenuService, CacheService],
  exports: [MenuService],
})
export class MenuModule {}
