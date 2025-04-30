import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with detailed configuration
  app.enableCors({
    origin: '*', // Allows all origins (useful for development)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Global validation pipe with transform enabled
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable auto-transformation
      transformOptions: {
        enableImplicitConversion: true, // Attempt to convert primitive types
      },
      whitelist: true, // Strip properties not in DTO
    }),
  );
  
  // Use port from environment variable or default to 3000
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
