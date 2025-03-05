import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ComplaintService } from './complaint.service';
import { Complaint } from '../../entities/complaint.entity';
import { CreateComplaintInput } from './dto/create-complaint.input';
import { UpdateComplaintInput } from './dto/update-complaint.input';

@Resolver(() => Complaint)
export class ComplaintResolver {
  constructor(private readonly complaintService: ComplaintService) {}

  @Mutation(() => Complaint)
  createComplaint(@Args('createComplaintInput') createComplaintInput: CreateComplaintInput) {
    return this.complaintService.create(createComplaintInput);
  }

  @Query(() => [Complaint], { name: 'complaint' })
  findAll() {
    return this.complaintService.findAll();
  }

  @Query(() => Complaint, { name: 'complaint' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.complaintService.findOne(id);
  }

  @Mutation(() => Complaint)
  updateComplaint(@Args('updateComplaintInput') updateComplaintInput: UpdateComplaintInput) {
    return this.complaintService.update(updateComplaintInput.id, updateComplaintInput);
  }

  @Mutation(() => Complaint)
  removeComplaint(@Args('id', { type: () => Int }) id: number) {
    return this.complaintService.remove(id);
  }
}
