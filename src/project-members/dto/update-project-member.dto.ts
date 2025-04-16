import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectMemberDto } from './create-project-member.dto';

/**
 * DTO para actualización de miembros del proyecto
 * Extiende de CreateProjectMemberDto pero hace todos los campos opcionales
 */
export class UpdateProjectMemberDto extends PartialType(CreateProjectMemberDto) {}

