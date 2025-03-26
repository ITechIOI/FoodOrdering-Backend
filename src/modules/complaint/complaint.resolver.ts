import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ComplaintService } from './complaint.service';
import { Complaint } from 'src/entities/complaint.entity';
import { CreateComplaintInput } from './dto/create-complaint.input';
import { UpdateComplaintInput } from './dto/update-complaint.input';
import { createPaginatedType } from 'src/utils/paginated';

const PaginatedComplaintResponse = createPaginatedType(
  Complaint,
  'PaginatedComplaintResponse',
);

@Resolver(() => Complaint)
export class ComplaintResolver {
  constructor(private readonly complaintService: ComplaintService) {}

  @Mutation(() => Complaint)
  async createComplaint(
    @Args('createComplaintInput') createComplaintInput: CreateComplaintInput,
  ): Promise<Complaint> {
    return this.complaintService.create(createComplaintInput);
  }

  @Query(() => PaginatedComplaintResponse, { name: 'complaints' })
  async findAll(
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ) {
    return await this.complaintService.findAll(page, limit);
  }

  @Query(() => Complaint, { name: 'complaint' })
  async findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Complaint> {
    return this.complaintService.findOne(id);
  }

  @Mutation(() => Complaint)
  async updateComplaint(
    @Args('updateComplaintInput') updateComplaintInput: UpdateComplaintInput,
  ): Promise<Complaint> {
    return this.complaintService.update(
      updateComplaintInput.id,
      updateComplaintInput,
    );
  }

  @Mutation(() => Complaint)
  async removeComplaint(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Complaint> {
    return this.complaintService.remove(id);
  }
}
