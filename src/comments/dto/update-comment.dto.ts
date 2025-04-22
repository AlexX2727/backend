import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';
import { IsString, IsOptional } from 'class-validator';

/**
 * DTO para actualizar un comentario existente
 * Extiende del DTO de creación pero hace todos los campos opcionales
 */
export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @IsString()
  @IsOptional()
  content?: string;
  
  // No permitimos cambiar la tarea o el usuario asociado al comentario
  task_id?: never;
  user_id?: never;
}

