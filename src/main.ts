import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';  

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API Documentation')  
    .setDescription('La documentation de l\'API de votre application')  
    .setVersion('1.0')  
    .addTag('auth')  
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

 
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 8000);  
}
bootstrap();
