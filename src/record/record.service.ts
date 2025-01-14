import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordEntity } from './record.entity';
import { CreateRecordDto } from './dto/create-record.dto';
import { UserEntity } from 'src/user/user.entity';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(RecordEntity)
    private readonly recordsRepository: Repository<RecordEntity>
  ) {}

  async create(
    userId: string,
    createRecordDto: CreateRecordDto
  ): Promise<RecordEntity> {
    const record = this.recordsRepository.create({
      ...createRecordDto,
      user: { id: userId },
    });
    return await this.recordsRepository.save(record);
  }

  async findOne(user: UserEntity, transactionId: string) {
    const isTaken = await this.recordsRepository.findOne({
      where: {
        transactionId,
        user: { id: user.id },
      },
    });

    return isTaken;
  }

  async findAll(userId: string, query): Promise<RecordEntity[]> {
    const qb = this.recordsRepository.createQueryBuilder('record');
    qb.where('record.userId = :userId', { userId });

    if (query.startDate) {
      qb.andWhere('record.purchaseDate >= :startDate', {
        startDate: query.startDate,
      });
    }
    if (query.endDate) {
      qb.andWhere('record.purchaseDate <= :endDate', {
        endDate: query.endDate,
      });
    }
    if (query.drawNumber) {
      qb.andWhere('record.drawNumber = :drawNumber', {
        drawNumber: query.drawNumber,
      });
    }

    return qb.getMany();
  }

  async deleteRecord(id: string): Promise<boolean> {
    try {
      const record = await this.recordsRepository.findOne({ where: { id } });
      if (!record) {
        console.error(`Record with id ${id} not found.`);
        return false;
      }

      await this.recordsRepository.remove(record);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
    }
  }
}
