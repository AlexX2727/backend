import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

/**
 * DTO para actualización de tareas
 * Extiende de CreateTaskDto pero hace todos los campos opcionales
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

