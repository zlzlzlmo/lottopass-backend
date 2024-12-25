import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LottoModule } from './lotto/lotto.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1', // IPv4 주소
      port: 3306, // MySQL 포트
      username: 'root',
      password: '', // 비밀번호 설정 (필요시)
      database: 'lotto',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),    
  LottoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
