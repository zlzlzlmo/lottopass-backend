import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinningRegionEntity } from './winning-region.entity';
import { UniqueRegionEntity } from './unique-region.entity';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(WinningRegionEntity)
    private readonly winningRegionRepository: Repository<WinningRegionEntity>,
    @InjectRepository(UniqueRegionEntity)
    private readonly uniqueRegionRepository: Repository<UniqueRegionEntity>
  ) {}

  async findByLocation(
    province: string,
    city: string
  ): Promise<WinningRegionEntity[]> {
    return this.winningRegionRepository.find({
      where: { province, city },
      relations: ['uniqueRegion'],
    });
  }

  async findByDrawNumber(drawNumber: number): Promise<WinningRegionEntity[]> {
    return this.winningRegionRepository.find({
      where: { drawNumber },
      relations: ['uniqueRegion'],
    });
  }

  async getAllRegions(): Promise<UniqueRegionEntity[]> {
    return await this.uniqueRegionRepository.find();
  }
}
