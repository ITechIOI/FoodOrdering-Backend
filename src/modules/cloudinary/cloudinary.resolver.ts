import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CloudinaryService } from './cloudinary.service';
import { CreateCloudinaryInput } from './dto/create-cloudinary.input';
import { UpdateCloudinaryInput } from './dto/update-cloudinary.input';
import { FileUpload, GraphQLUpload } from 'graphql-upload-minimal';
import { ReadStream } from 'fs';

@Resolver()
export class CloudinaryResolver {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // @Mutation(() => User)
  // async uploadAvatar(
  //   @Args('id', { type: () => Int }) id: number,
  //   @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload, // ✅ dùng type đúng
  // ): Promise<User> {
  //   console.log('Resolved file:', file); // 👍 chính là file rồi
  //   return await this.usersService.updateAvatar(id, file); // truyền trực tiếp
  // }

  // async createAvatar(id: number, file: FileUpload) {
  //     const user = await this.findOneById(id);

  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }

  //     try {
  //       const { createReadStream, filename, mimetype } = file;

  //       if (!createReadStream) {
  //         throw new Error('createReadStream is not available');
  //       }

  //       const stream = createReadStream();
  //       const uploadResponse = await this.cloudinaryService.uploadImage(stream);
  //       console.log('Upload response: ', uploadResponse);
  //       const imageUrl =
  //         uploadResponse.secure_url + ' ' + uploadResponse.public_id;
  //       const newUser = this.userRepository.create({
  //         ...user,
  //         avatar: imageUrl,
  //       });
  //       this.userRepository.save(newUser);

  //       return uploadResponse.secure_url;
  //     } catch (error) {
  //       console.error('Upload error:', error);
  //       throw new InternalServerErrorException(error.message);
  //     }
  //   }

  // async updateAvatar(id: number, file: FileUpload) {
  //     const user = await this.findOneById(id);
  //     console.log('User found:', user);
  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }
  //     //  / console.log('User found:', user.avatar);
  //     const oldPublicId = user.avatar.split(' ')[1];
  //     console.log('User found:', oldPublicId);
  //     const deleteOldImage =
  //       await this.cloudinaryService.deleteImage(oldPublicId);
  //     console.log('Delete old image:', deleteOldImage);
  //     let imageUrl: string = '';
  //     try {
  //       const { createReadStream, filename, mimetype } = file;

  //       if (!createReadStream) {
  //         throw new Error('createReadStream is not available');
  //       }

  //       const stream = createReadStream();
  //       const uploadResponse = await this.cloudinaryService.uploadImage(stream);
  //       console.log('Upload response: ', uploadResponse);
  //       imageUrl = uploadResponse.secure_url + ' ' + uploadResponse.public_id;
  //       const newUser = this.userRepository.create({
  //         ...user,
  //         avatar: imageUrl,
  //       });
  //       return this.userRepository.save(newUser);
  //       // const saveUser = await this.userRepository.save(newUser);
  //     } catch (error) {
  //       console.error('Upload error:', error);
  //       throw new InternalServerErrorException(error.message);
  //     }
  //   }

  //   async remove(id: number) {
  //     const user = await this.findOneById(id);
  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }
  //     user.deletedAt = new Date();
  //     return await this.userRepository.save(user);
  //   }

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
