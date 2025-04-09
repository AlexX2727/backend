import { 
  IsEmail, 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsBoolean,
  MinLength 
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsInt()
  role_id: number;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean = true;
}

