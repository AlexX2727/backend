import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * Servicio para el envío de correos electrónicos utilizando la API de Brevo
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;
  private readonly frontendUrl: string;
  private readonly apiUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY') as string;
    this.senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL') as string;
    this.senderName = this.configService.get<string>('BREVO_SENDER_NAME') as string;
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') as string;

    if (!this.apiKey || !this.senderEmail || !this.senderName || !this.frontendUrl) {
      this.logger.error('Configuración de correo incompleta');
      throw new Error('Configuración de correo incompleta');
    }
  }

  /**
   * Envía un correo electrónico para la recuperación de contraseña
   * @param to Dirección de correo electrónico del destinatario
   * @param username Nombre de usuario (opcional)
   * @param token Token para resetear la contraseña
   * @returns Resultado de la operación
   * @deprecated Usar sendVerificationCode en su lugar
   */
  async sendPasswordResetEmail(to: string, username: string, token: string): Promise<boolean> {
    try {
      const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;
      
      const htmlContent = `
        <html>
          <body>
            <h1>Recuperación de contraseña - TaskMaster</h1>
            <p>Hola ${username || 'usuario'},</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            <p><a href="${resetLink}">Restablecer mi contraseña</a></p>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este mensaje y tu contraseña seguirá siendo la misma.</p>
            <p>Saludos,<br>El equipo de TaskMaster</p>
          </body>
        </html>
      `;

      const textContent = `
        Recuperación de contraseña - TaskMaster
        
        Hola ${username || 'usuario'},
        
        Has solicitado restablecer tu contraseña. Para crear una nueva contraseña, visita el siguiente enlace:
        
        ${resetLink}
        
        Este enlace expirará en 1 hora.
        
        Si no solicitaste este cambio, puedes ignorar este mensaje y tu contraseña seguirá siendo la misma.
        
        Saludos,
        El equipo de TaskMaster
      `;

      const payload = {
        sender: {
          name: this.senderName,
          email: this.senderEmail,
        },
        to: [
          {
            email: to,
            name: username || to,
          },
        ],
        subject: 'Recuperación de contraseña - TaskMaster',
        htmlContent,
        textContent,
      };

      const headers = {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      };

      this.logger.log(`Enviando correo de recuperación a: ${to}`);
      const response = await axios.post(this.apiUrl, payload, { headers });
      
      this.logger.log(`Correo enviado exitosamente a: ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Error al enviar correo: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al enviar correo de recuperación de contraseña');
    }
  }

  /**
   * Envía un correo electrónico con un código de verificación para recuperar la contraseña
   * @param to Dirección de correo electrónico del destinatario
   * @param username Nombre de usuario (opcional)
   * @param code Código de verificación para restablecer la contraseña
   * @returns Resultado de la operación
   */
  async sendVerificationCode(to: string, username: string, code: string): Promise<boolean> {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <h1 style="color: #2c3e50; text-align: center;">Recuperación de contraseña - TaskMaster</h1>
              <p>Hola ${username || 'usuario'},</p>
              <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código de verificación:</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; border: 1px solid #dee2e6;">
                <h2 style="margin: 0; color: #007bff; letter-spacing: 2px; font-size: 24px;">${code}</h2>
              </div>
              
              <p>Ingresa este código en la página de recuperación de contraseña para continuar con el proceso.</p>
              <p><strong>Importante:</strong> Este código expirará en 15 minutos por razones de seguridad.</p>
              <p>Si no solicitaste este cambio, puedes ignorar este mensaje y tu contraseña seguirá siendo la misma.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #6c757d;">Por razones de seguridad, nunca compartas este código con nadie. El equipo de TaskMaster nunca te pedirá este código por teléfono o correo electrónico.</p>
              <p>Saludos,<br>El equipo de TaskMaster</p>
            </div>
          </body>
        </html>
      `;

      const textContent = `
        Recuperación de contraseña - TaskMaster
        
        Hola ${username || 'usuario'},
        
        Has solicitado restablecer tu contraseña. Utiliza el siguiente código de verificación:
        
        ${code}
        
        Ingresa este código en la página de recuperación de contraseña para continuar con el proceso.
        
        IMPORTANTE: Este código expirará en 15 minutos por razones de seguridad.
        
        Si no solicitaste este cambio, puedes ignorar este mensaje y tu contraseña seguirá siendo la misma.
        
        Por razones de seguridad, nunca compartas este código con nadie. El equipo de TaskMaster nunca te pedirá este código por teléfono o correo electrónico.
        
        Saludos,
        El equipo de TaskMaster
      `;

      const payload = {
        sender: {
          name: this.senderName,
          email: this.senderEmail,
        },
        to: [
          {
            email: to,
            name: username || to,
          },
        ],
        subject: 'Código de verificación para recuperar contraseña - TaskMaster',
        htmlContent,
        textContent,
      };

      const headers = {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      };

      this.logger.log(`Enviando código de verificación a: ${to}`);
      const response = await axios.post(this.apiUrl, payload, { headers });
      
      this.logger.log(`Código de verificación enviado exitosamente a: ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Error al enviar código de verificación: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al enviar código de verificación para recuperación de contraseña');
    }
  }
}

