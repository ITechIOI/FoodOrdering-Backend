import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressResolver } from './address.resolver';
import { Address } from 'src/entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address])],
  providers: [AddressResolver, AddressService],
  exports: [AddressService],
})
export class AddressModule {}
