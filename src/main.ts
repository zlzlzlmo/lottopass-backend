import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
    // CORS 설정
    app.enableCors({
      origin: 'http://localhost:5173', // 요청을 허용할 도메인
      methods: 'GET,POST,PUT,DELETE', // 허용할 HTTP 메서드
      credentials: true, // 쿠키 인증 정보 전송 허용
    });
  
    app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
