import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

/**
 * DTO para actualización de proyectos
 * Extiende de CreateProjectDto pero hace todos los campos opcionales
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

