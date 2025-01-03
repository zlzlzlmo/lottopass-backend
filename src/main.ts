import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  const isProduction = process.env.NODE_ENV === 'production';

  // CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://www.lottopass.co.kr',
      'http://localhost:4173',
    ],
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  // Global Filters 및 Pipes 설정
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // 포트 설정
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  console.log(`Server is running on: http://localhost:${PORT}`);
}
bootstrap();
