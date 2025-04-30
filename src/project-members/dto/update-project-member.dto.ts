import { PartialType, OmitType, PickType } from '@nestjs/mapped-types';
import { CreateProjectMemberDto, ProjectRole } from './create-project-member.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
/**
 * DTO para actualización de miembros del proyecto
 * 
 * Este DTO solo permite actualizar el rol del miembro en el proyecto.
 * No se permite cambiar el proyecto o el usuario de un miembro existente.
 * 
 * Roles disponibles:
 * - Member: Miembro regular del proyecto
 * - Leader: Líder de equipo con responsabilidades adicionales
 * - Collaborator: Colaborador que aporta al proyecto
 * - Observer: Miembro con acceso de solo lectura
 * - ProjectManager: Gerente del proyecto con máximas responsabilidades
 */
export class UpdateProjectMemberDto {
  @IsOptional()
  @IsEnum(ProjectRole, {
    message: 'El rol debe ser uno de los siguientes: Member, Leader, Collaborator, Observer, ProjectManager'
  })
  role?: ProjectRole;
}
