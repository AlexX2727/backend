import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  // Fixed role_id=2 for client users, not modifiable
  role_id: number = 2; // Client role
  
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

  @IsOptional()
  @IsBoolean()
  status?: boolean = true;
}
