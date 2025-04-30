import { v2 as cloudinary } from 'cloudinary';
import { ConfigOptions } from 'cloudinary';
import { Injectable, Provider, Module } from '@nestjs/common';

export const CLOUDINARY = 'Cloudinary';

// Configuration for Cloudinary
export const CloudinaryConfig: ConfigOptions = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
};

// Initialize Cloudinary with the configuration
export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY,
  useFactory: (): ConfigOptions => {
    cloudinary.config(CloudinaryConfig);
    return cloudinary;
  },
};

@Injectable()
export class CloudinaryService {
  constructor() {}

  async uploadImage(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      // Convert the buffer to a stream and pipe it to the upload stream
      const Readable = require('stream').Readable;
      const readableInstance = new Readable({
        read() {
          this.push(file.buffer);
          this.push(null);
        },
      });

      readableInstance.pipe(uploadStream);
    });
  }
}

// Cloudinary module configuration
@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}

