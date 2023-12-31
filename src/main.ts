import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS for specific origins
  app.enableCors({
    origin: 'https://ricqcodes.dev',
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
