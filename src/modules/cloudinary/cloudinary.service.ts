import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import { FileUpload } from 'graphql-upload-minimal';
import { ReadStream } from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    stream: ReadStream, 
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: '/uploads' },
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(new Error('Upload failed, result is undefined'));
          resolve(result);
        },
      );

      stream.pipe(uploadStream); 
    });
  }

  async deleteImage(
    publicId: string,
  ): Promise<{ result: string } | UploadApiErrorResponse> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }
}
