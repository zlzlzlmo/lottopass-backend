import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { RegionModule } from './region/region.module';
import { DrawModule } from './draw/draw.module';
import { LocationModule } from './location/location.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LottoCombinationModule } from './lotto-combination/lotto-combination.module';
import { UserEntity } from './user/user.entity';
import { LottoCombinationEntity } from './lotto-combination/lotto-combination.entity';

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
        host: configService.get<string>('MYSQLHOST'),
        port: configService.get<number>('MYSQLPORT', 3306),
        username: configService.get<string>('MYSQLUSER'),
        password: configService.get<string>('MYSQLPASSWORD'),
        database: configService.get<string>('MYSQLDATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
      }),
      inject: [ConfigService],
    }),
    RegionModule,
    DrawModule,
    LocationModule,
    AuthModule,
    UserModule,
    LottoCombinationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
