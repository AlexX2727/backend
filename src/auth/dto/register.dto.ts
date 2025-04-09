import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNumber()
  @IsOptional()
  role_id?: number = 2; // Default to USER role (assuming ID 2 will be for USER)
  
  @IsOptional()
  @IsString()
  username?: string;
  
  @IsOptional()
  @IsString()
  firstName?: string;
  
  @IsOptional()
  @IsString()
  lastName?: string;
  
  @IsOptional()
  @IsString()
  avatar?: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
}

