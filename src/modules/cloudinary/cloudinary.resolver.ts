import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CloudinaryService } from './cloudinary.service';
import { Cloudinary } from './entities/cloudinary.entity';
import { CreateCloudinaryInput } from './dto/create-cloudinary.input';
import { UpdateCloudinaryInput } from './dto/update-cloudinary.input';

@Resolver(() => Cloudinary)
export class CloudinaryResolver {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
}
