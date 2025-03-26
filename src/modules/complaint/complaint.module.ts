import { Module } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { ComplaintResolver } from './complaint.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Complaint } from 'src/entities/complaint.entity';
import { UsersModule } from '../users/users.module';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [TypeOrmModule.forFeature([Complaint]), UsersModule, ReviewModule],
  providers: [ComplaintResolver, ComplaintService],
  exports: [ComplaintService],
})
export class ComplaintModule {}
