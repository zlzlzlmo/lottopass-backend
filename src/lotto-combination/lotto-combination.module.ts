import { Module } from '@nestjs/common';
import { LottoCombinationController } from './lotto-combination.controller';
import { LottoCombinationService } from './lotto-combination.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LottoCombinationEntity } from './lotto-combination.entity';
import { UserModule } from 'src/user/user.module';
import { LottoCombinationRepository } from './lotto-combination.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LottoCombinationEntity]), UserModule],
  controllers: [LottoCombinationController],
  providers: [LottoCombinationService, LottoCombinationRepository],
  exports: [LottoCombinationService],
})
export class LottoCombinationModule {}
