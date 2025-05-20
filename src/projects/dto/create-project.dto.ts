import { 
  IsNotEmpty, 
  IsInt, 
  IsString, 
  IsOptional, 
  IsDateString,
  IsEnum
} from 'class-validator';

/**
 * DTO para la creación de un nuevo proyecto
 * Define y valida los datos necesarios para crear un proyecto
 */
export class CreateProjectDto {
  @IsNotEmpty()
  @IsInt()
  owner_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['Active', 'Inactive', 'Completed', 'On Hold'])
  status?: string = 'Active';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

