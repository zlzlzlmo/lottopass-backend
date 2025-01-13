import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { RecordEntity } from './record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecordEntity])],
  controllers: [RecordController],
  providers: [RecordService],
})
export class RecordModule {}
