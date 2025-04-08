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

  async  signUp(email: string, password: string){
     try{
        const userFound = await this.prismaService.user.findUnique({
            where: {
                email,
            },
        });

        if (userFound) throw new BadGatewayException('El usuario ya existe');

        const hashedPaswword= await encrypt(password);

        const user = await this.prismaService.user.create({
            data: {
                email,
                password: hashedPaswword,
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
