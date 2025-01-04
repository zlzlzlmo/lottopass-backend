import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LottoModule } from './lotto/lotto.module'; // LottoModule 추가
import { ScheduleModule } from '@nestjs/schedule';
import { RegionModule } from './region/region.module';
import { DrawModule } from './draw/draw.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV
        ? `.env.${process.env.NODE_ENV}`
        : '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('MYSQLHOST'), // Railway 환경 변수
        port: configService.get<number>('MYSQLPORT', 3306),
        username: configService.get<string>('MYSQLUSER'),
        password: configService.get<string>('MYSQLPASSWORD'),
        database: configService.get<string>('MYSQLDATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true), // 프로덕션에서는 false 권장
      }),
      inject: [ConfigService],
    }),
    LottoModule,
    RegionModule,
    DrawModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
