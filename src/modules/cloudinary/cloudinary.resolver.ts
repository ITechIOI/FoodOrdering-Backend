import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CloudinaryService } from './cloudinary.service';
import { CreateCloudinaryInput } from './dto/create-cloudinary.input';
import { UpdateCloudinaryInput } from './dto/update-cloudinary.input';

@Resolver()
export class CloudinaryResolver {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
}
