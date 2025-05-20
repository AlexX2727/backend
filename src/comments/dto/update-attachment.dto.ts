import { PartialType } from '@nestjs/mapped-types';
import { CreateAttachmentDto } from './create-attachment.dto';
import { IsString, IsOptional, IsNumber } from 'class-validator';

/**
 * DTO para actualizar un archivo adjunto existente
 */
export class UpdateAttachmentDto extends PartialType(CreateAttachmentDto) {
  @IsString()
  @IsOptional()
  filename?: string;

  @IsString()
  @IsOptional()
  originalName?: string;

  @IsString()
  @IsOptional()
  path?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsNumber()
  @IsOptional()
  size?: number;
  
  // No permitimos cambiar la tarea o el usuario asociado al archivo
  task_id?: never;
  user_id?: never;
}