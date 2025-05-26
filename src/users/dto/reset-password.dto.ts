import { IsNotEmpty, IsString, MinLength, Matches, IsEmail } from 'class-validator';
import { Match } from 'src/libs/decorators/match.decorator';

/**
 * DTO para el restablecimiento de contraseña
 * 
 * Contiene el código de verificación y la nueva contraseña
 */
export class ResetPasswordDto {
  /**
   * Código de verificación recibido por correo electrónico
   */
  @IsNotEmpty({ message: 'El código de verificación es requerido' })
  @IsString({ message: 'El código de verificación debe ser una cadena de texto' })
  code: string;

  /**
   * Email del usuario
   */
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El formato de email no es válido' })
  email: string;

  /**
   * Nueva contraseña del usuario
   * @minLength 6
   */
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;

  /**
   * Confirmación de la nueva contraseña
   * @minLength 6
   */
  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  @IsString({ message: 'La confirmación de contraseña debe ser una cadena de texto' })
  @Match('password', { message: 'Las contraseñas no coinciden' })
  confirmPassword: string;
}

