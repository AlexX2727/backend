import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, encrypt } from 'src/libs/bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService,     private jwtService: JwtService) {}

    async logIn (email: string, password: string){
        try{
            //bucar si existe el correo 
            const user = await this.prismaService.user.findUnique({
                where: {
                    email,
                },
            });
            if (!user) {
                throw new BadRequestException('email o contraseña incorrecta');
            }
            
            const isPasswordMatch = await compare(password, user.password);
            if (!isPasswordMatch) {
                throw new BadRequestException('email o contraseña incorrecta');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {password: _, ...userWithoutPassword} = user;

            const payload = {
                userWithoutPassword
            }

            const acces_token = await this.jwtService.signAsync(payload);
            return { acces_token};

        }catch(error){
            if (error instanceof BadRequestException) {
                throw error;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            throw new InternalServerErrorException('error al loguear');

        }
    }



   async getUsers(){
       return await this.prismaService.user.findMany();
   }

async signUp(registerDto: import('./dto/register.dto').RegisterDto){
     try{
        // Check if user with this email already exists
        const emailFound = await this.prismaService.user.findUnique({
            where: {
                email: registerDto.email,
            },
        });

        if (emailFound) throw new BadGatewayException('El email ya está registrado');

        // Check if username is provided and if it already exists
        if (registerDto.username) {
            const usernameFound = await this.prismaService.user.findUnique({
                where: {
                    username: registerDto.username,
                },
            });

            if (usernameFound) throw new BadGatewayException('El nombre de usuario ya está en uso');
        }

        const hashedPassword = await encrypt(registerDto.password);

        const user = await this.prismaService.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                username: registerDto.username,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                avatar: registerDto.avatar,
                phone: registerDto.phone,
                role: {
                    connect: {
                        id: registerDto.role_id || 2, // Default to USER role if not specified
                    }
                }
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {password: _, ...userWithoutPassword} = user;

        const payload = {
            userWithoutPassword
        }
   const acces_token = await this.jwtService.signAsync(payload);
            return { acces_token};
     }catch(error){
      if(error instanceof BadGatewayException){
          throw error;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
     }
    }

}
