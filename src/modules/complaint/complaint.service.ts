import { Injectable } from '@nestjs/common';
import { CreateComplaintInput } from './dto/create-complaint.input';
import { UpdateComplaintInput } from './dto/update-complaint.input';

@Injectable()
export class ComplaintService {
  create(createComplaintInput: CreateComplaintInput) {
    return 'This action adds a new complaint';
  }

  findAll() {
    return `This action returns all complaint`;
  }

  findOne(id: number) {
    return `This action returns a #${id} complaint`;
  }

  update(id: number, updateComplaintInput: UpdateComplaintInput) {
    return `This action updates a #${id} complaint`;
  }

  remove(id: number) {
    return `This action removes a #${id} complaint`;
  }
}
