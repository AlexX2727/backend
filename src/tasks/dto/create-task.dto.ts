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
  @IsInt()
  project_id: number;

  @IsOptional()
  @IsInt()
  assignee_id?: number;

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
  @IsDateString()
  dueDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  estimatedHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  actualHours?: number;

  @IsOptional()
  @IsDateString()
  completedAt?: Date;
}

