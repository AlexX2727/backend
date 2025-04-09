import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

interface UserDto {
    email : string;
    password : string;
}

@Controller('auth')
export class AuthController {
    
    constructor(private readonly authService: AuthService) {}
    @Post('login')
    login(@Body() user: UserDto){

        return this.authService.logIn(user.email, user.password); 
    }
//retornar para ver listas de usuarios
    @Get('users')
    getusers(){

        return this.authService.getUsers();
    }
    @Post('singup')
    signUp(@Body() registerDto: RegisterDto){
        console.log(registerDto);
        return this.authService.signUp(registerDto);
    }
}
