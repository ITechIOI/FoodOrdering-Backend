import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressResolver } from './address.resolver';
import { Address } from 'src/entities/address.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Address]), JwtModule],
  providers: [AddressResolver, AddressService, AuthGuard],
  exports: [AddressService],
})
export class AddressModule {}
