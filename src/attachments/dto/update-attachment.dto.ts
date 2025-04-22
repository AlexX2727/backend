import { PartialType } from '@nestjs/mapped-types';
import { CreateAttachmentDto } from './create-attachment.dto';

/**
 * DTO para actualizar un archivo adjunto existente
 * Extiende del DTO de creación pero hace todos los campos opcionales
 * Nota: Generalmente no se actualizan los archivos adjuntos, solo se eliminan y crean nuevos
 */
export class UpdateAttachmentDto extends PartialType(CreateAttachmentDto) {
  // No permitimos cambiar estos campos después de la creación
  task_id?: never;
  user_id?: never;
  filename?: never;
  originalName?: never;
  path?: never;
  mimeType?: never;
  size?: never;
}

