import { IsInt, IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

/**
 * DTO para crear un nuevo archivo adjunto
 * Contiene los campos requeridos y sus validaciones
 */
export class CreateAttachmentDto {
  @IsInt()
  @IsNotEmpty()
  task_id: number;

  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  originalName: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  size: number;
}

