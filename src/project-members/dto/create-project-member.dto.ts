import { IsNotEmpty, IsInt, IsString, IsEnum, IsOptional } from 'class-validator';

/**
 * DTO para la creación de un nuevo miembro del proyecto
 * Define y valida los datos necesarios para agregar un miembro a un proyecto
 */
export class CreateProjectMemberDto {
  @IsNotEmpty()
  @IsInt()
  project_id: number;

  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsOptional()
  @IsString()
  @IsEnum(['Member', 'Admin', 'Owner', 'Viewer', 'Editor'])
  role?: string = 'Member';
}

