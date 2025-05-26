import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * DTO para la solicitud de recuperación de contraseña
 * 
 * Contiene el correo electrónico del usuario que solicita 
 * restablecer su contraseña
 */
export class ForgotPasswordDto {
  /**
   * Correo electrónico del usuario
   * @example "usuario@ejemplo.com"
   */
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;
}

