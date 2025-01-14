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
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { RecordModule } from './record/record.module';
import { AuthGlobalModule } from './jwt-global.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: `redis://default:${configService.get<string>(
            'REDIS_PASSWORD'
          )}@${configService.get<string>(
            'REDIS_HOST'
          )}:${configService.get<number>('REDIS_PORT')}`,
        }),
        ttl: configService.get<number>('REDIS_TTL', 300),
      }),
    }),
    AuthGlobalModule,
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
    RecordModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
