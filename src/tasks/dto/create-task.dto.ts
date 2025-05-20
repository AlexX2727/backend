import { 
  IsNotEmpty, 
  IsInt, 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsNumber,
  IsDateString,
  Min,
  Max 
} from 'class-validator';

/**
 * DTO para la creación de una nueva tarea
 * Define y valida los datos necesarios para crear una tarea
 */
export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['Todo', 'In Progress', 'Review', 'Done', 'Blocked'])
  status?: string = 'Todo';

  @IsOptional()
  @IsString()
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  priority?: string = 'Medium';

  @IsOptional()
  @IsString()
  dueDate?: string; // Cambiado a string

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  estimatedHours?: number;

  @IsOptional()
  @IsString()
  actualHours?: string; // Cambiado a string

  @IsOptional()
  @IsString()
  completedAt?: string; // Cambiado a string

  @IsNotEmpty()
  @IsInt()
  project_id: number;

  @IsOptional()
  @IsInt()
  assignee_id?: number;
}

