// update-task.dto.ts en el backend
import { IsOptional, IsString, IsInt, IsNumber } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsString()
  actualHours?: string;

  @IsOptional()
  @IsString()
  completedAt?: string;

  @IsOptional()
  @IsInt()
  assignee_id?: number;
}