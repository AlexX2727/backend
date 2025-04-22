import { IsInt, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para crear un nuevo comentario
 * Contiene los campos requeridos y sus validaciones
 */
export class CreateCommentDto {
  @IsInt()
  @IsNotEmpty()
  task_id: number;

  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}

