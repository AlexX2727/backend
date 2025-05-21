// cloudinary.service.ts
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

  /**
   * Upload a file to Cloudinary
   * @param file - The file to upload
   * @param options - Upload options
   * @returns Promise with upload result
   */
  async uploadFile(
    file: Express.Multer.File,
    options: {
      folder?: string;
      resourceType?: 'image' | 'video' | 'raw' | 'auto';
      publicId?: string;
      tags?: string[];
      format?: string;
    } = {},
  ): Promise<any> {
    // Determinar el formato basado en el tipo MIME
    let format = options.format;
    
    // Para archivos PDF, Word, Excel, etc. forzamos 'raw' para mejor manejo
    if (
      file.mimetype.includes('pdf') || 
      file.mimetype.includes('word') || 
      file.mimetype.includes('excel') || 
      file.mimetype.includes('powerpoint') || 
      file.mimetype.includes('zip') ||
      file.mimetype.includes('msword') ||
      file.mimetype.includes('officedocument')
    ) {
      options.resourceType = 'raw';
    }
    
    // Default options
    const uploadOptions = {
      folder: options.folder || 'uploads',
      resource_type: options.resourceType || 'auto',
      public_id: options.publicId,
      tags: options.tags,
      format: format
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
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

  /**
   * Upload an image to Cloudinary (maintained for backward compatibility)
   * @param file - The image file to upload
   * @returns Promise with upload result
   */
  async uploadImage(file: Express.Multer.File): Promise<any> {
    return this.uploadFile(file, { folder: 'avatars', resourceType: 'image' });
  }

  /**
   * Upload a task attachment to Cloudinary
   * @param file - The attachment file to upload
   * @param taskId - The ID of the task this attachment belongs to
   * @returns Promise with upload result
   */
async uploadTaskAttachment(file: Express.Multer.File, taskId: number): Promise<any> {
  // Limpiar el nombre de archivo eliminando caracteres problemáticos
  const cleanFilename = file.originalname.replace(/[^\w\s.-]/g, '');
  
  // Obtener extensión del archivo
  const fileExt = cleanFilename.split('.').pop() || '';
  
  // Generar un ID único pero conservando la extensión para mejor manejo
  const publicId = `task_${taskId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // Para archivos como PDF, Word, Excel, etc. el tipo de recurso 'raw' es mejor
  let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
  
  if (
    file.mimetype.includes('pdf') || 
    file.mimetype.includes('word') || 
    file.mimetype.includes('excel') || 
    file.mimetype.includes('powerpoint') || 
    file.mimetype.includes('zip') ||
    file.mimetype.includes('msword') ||
    file.mimetype.includes('officedocument')
  ) {
    resourceType = 'raw';
  }
  
  return this.uploadFile(file, {
    folder: `task_attachments/${taskId}`,
    resourceType: resourceType,
    publicId: publicId,
    tags: [`task_${taskId}`, 'attachment', `original:${cleanFilename}`],
  });
}

  /**
   * Delete a file from Cloudinary
   * @param publicId - The public ID of the file to delete
   * @returns Promise with deletion result
   */
  async deleteFile(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }
}

// Cloudinary module configuration
@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}