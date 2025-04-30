import { 
  IsOptional, 
  IsString, 
  IsEmail, 
  IsInt, 
  IsBoolean, 
  MinLength 
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

/**
 * Data Transfer Object for updating a user
 * All fields are optional, and form data fields are properly transformed
 */
export class UpdateUserDto {
  /**
   * ID of the user's role
   */
  @IsOptional()
  @IsInt({ message: 'Role ID debe ser un número entero' })
  @Transform(({ value }: TransformFnParams) => {
    // Handle empty values from form data
    if (value === undefined || value === '' || value === null) return undefined;
    const parsed = Number(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  role_id?: number;

  /**
   * Email del usuario
   */
  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @Transform(({ value }: TransformFnParams) => {
    return value === '' ? undefined : value;
  })
  email?: string;

  /**
   * Contraseña del usuario
   */
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Transform(({ value }: TransformFnParams) => {
    return value === '' ? undefined : value;
  })
  password?: string;

  /**
   * Nombre del usuario
   */
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Transform(({ value }: TransformFnParams) => {
    return value === '' ? undefined : value;
  })
  firstName?: string;

  /**
   * Apellido del usuario
   */
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @Transform(({ value }: TransformFnParams) => {
    return value === '' ? undefined : value;
  })
  lastName?: string;

  /**
   * Nombre de usuario (único)
   */
  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @Transform(({ value }: TransformFnParams) => {
    return value === '' ? undefined : value;
  })
  username?: string;

  /**
   * Número telefónico del usuario
   */
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Transform(({ value }: TransformFnParams) => {
    return value === '' ? undefined : value;
  })
  phone?: string;

  /**
   * URL of the user's avatar image
   * This can be set programmatically when a file is uploaded
   */
  @IsOptional()
  @IsString({ message: 'La URL del avatar debe ser una cadena de texto' })
  @Transform(({ value }: TransformFnParams) => {
    return value === '' ? undefined : value;
  })
  avatar?: string;

  /**
   * Estado del usuario (activo/inactivo)
   */
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  @Transform(({ value }: TransformFnParams) => {
    // Handle empty values from form data
    if (value === undefined || value === '' || value === null) return undefined;
    
    // Convert string representations to boolean
    if (typeof value === 'string') {
      const lowercaseValue = value.toLowerCase();
      return lowercaseValue === 'true' || lowercaseValue === '1';
    }
    
    // Convert numeric values to boolean
    if (typeof value === 'number') {
      return value === 1;
    }
    
    return Boolean(value);
  })
  status?: boolean;
}
