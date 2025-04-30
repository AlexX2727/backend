import { IsNotEmpty, IsInt, IsString, IsEnum, Matches } from 'class-validator';

/**
 * Enumeración de roles disponibles para miembros de proyectos
 */
export enum ProjectRole {
  MEMBER = 'Member',
  LEADER = 'Leader',
  COLLABORATOR = 'Collaborator',
  OBSERVER = 'Observer',
  PROJECT_MANAGER = 'ProjectManager'
}

/**
 * DTO para la creación de un nuevo miembro del proyecto
 * Define y valida los datos necesarios para agregar un miembro a un proyecto
 * 
 * - project_id: ID del proyecto al que se agregará el miembro
 * - user_identifier: Nombre de usuario o correo electrónico del usuario a agregar
 *   (El usuario debe estar registrado en el sistema)
 * - role: Rol del miembro en el proyecto
 *   - Member: Miembro regular del proyecto
 *   - Leader: Líder de equipo con responsabilidades adicionales
 *   - Collaborator: Colaborador que aporta al proyecto
 *   - Observer: Miembro con acceso de solo lectura
 *   - ProjectManager: Gerente del proyecto con máximas responsabilidades
 */
export class CreateProjectMemberDto {
  @IsNotEmpty({ message: 'El ID del proyecto es requerido' })
  @IsInt({ message: 'El ID del proyecto debe ser un número entero' })
  project_id: number;

  @IsNotEmpty({ message: 'El identificador de usuario es requerido' })
  @IsString({ message: 'El identificador debe ser una cadena de texto' })
  @Matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$|^[a-zA-Z0-9_-]{3,20}$/, {
    message: 'Ingrese un correo electrónico válido o un nombre de usuario (3-20 caracteres)'
  })
  user_identifier: string; // Nombre de usuario o correo electrónico

  @IsNotEmpty({ message: 'El rol del miembro es requerido' })
  @IsEnum(ProjectRole, {
    message: 'El rol debe ser uno de los siguientes: Member, Leader, Collaborator, Observer, ProjectManager'
  })
  role: ProjectRole = ProjectRole.MEMBER;
}
