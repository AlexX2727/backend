import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() //metodos get que proveen informacion 
  getHello(): string {
    return 'Hola Mundo';
  }
}
