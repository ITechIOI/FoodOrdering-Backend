import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CloudinaryService } from './cloudinary.service';
import { CreateCloudinaryInput } from './dto/create-cloudinary.input';
import { UpdateCloudinaryInput } from './dto/update-cloudinary.input';
import { FileUpload, GraphQLUpload } from 'graphql-upload-minimal';
import { ReadStream } from 'fs';

@Resolver()
export class CloudinaryResolver {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // api to upload image to cloudinary following to above code
  @Mutation(() => String)
  async uploadToCloudinary(
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
  ): Promise<string> {
    const { createReadStream, filename } = file;

    if (!createReadStream) {
      throw new Error('File stream is not available');
    }

    const stream: ReadStream = createReadStream();
    const result = await this.cloudinaryService.uploadImage(stream);

    if ('secure_url' in result) {
      return result.secure_url + ' ' + result.public_id;
    } else {
      throw new Error('Cloudinary upload failed');
    }
  }
}
