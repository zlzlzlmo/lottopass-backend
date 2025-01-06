import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinningRegionEntity } from './winning-region.entity';
import { UniqueRegionEntity } from './unique-region.entity';

import { StoreRegionEntity } from './store-region.entity';
import { CrawlerService } from 'src/crawler/crawler.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class RegionService {
  private readonly logger = new Logger(RegionService.name);

  constructor(
    @InjectRepository(WinningRegionEntity)
    private readonly winningRegionRepository: Repository<WinningRegionEntity>,
    @InjectRepository(UniqueRegionEntity)
    private readonly uniqueRegionRepository: Repository<UniqueRegionEntity>,
    @InjectRepository(StoreRegionEntity)
    private readonly storeRegionEntity: Repository<StoreRegionEntity>,
    private readonly crawlerService: CrawlerService
  ) {}

  async findWinningStoresByDrawNumber(drawNumber: number): Promise<boolean> {
    const res = await this.winningRegionRepository.exists({
      where: {
        drawNumber,
      },
    });
    return res;
  }

  async findByLocation(
    province: string,
    city?: string
  ): Promise<WinningRegionEntity[]> {
    const whereCondition: Record<string, any> = { province };

    if (city) {
      whereCondition.city = city;
    }

    return this.winningRegionRepository.find({
      where: whereCondition,
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
    const regions = await this.uniqueRegionRepository
      .createQueryBuilder('region')
      .select([
        'region.id As id',
        'SUBSTRING(region.province, 1, 2) AS province',
        'region.city As city',
      ])
      .getRawMany();

    return regions.map((region) => ({
      ...region,
      province: region.province,
    })) as UniqueRegionEntity[];
  }

  async fetchAllStores(
    province: string,
    city?: string
  ): Promise<StoreRegionEntity[]> {
    const existingStores = await this.storeRegionEntity.find({
      where: { province, city },
    });

    if (existingStores.length > 0) {
      return existingStores;
    }

    const stores = await this.crawlerService.crawlLottoStores(province, city);

    const processedStores = stores.map((store) =>
      this.storeRegionEntity.create({
        province: store.province,
        city: store.city,
        fullAddress: store.fullAddress || '알 수 없음',
        latitude: store.latitude,
        longitude: store.longitude,
        storeName: store.storeName || '알 수 없음',
        phone: store.phone || null,
      })
    );

    try {
      await this.storeRegionEntity.save(processedStores);
      return processedStores;
    } catch (error) {
      console.error('Save Error:', error);
      throw new Error('Failed to save stores to the database');
    }
  }

  // @Cron('0 0 * * 1#1,3') // 매월 첫 번째와 세 번째 월요일
  // async clearStoreData() {
  //   this.logger.log('Clearing store data...');
  //   await this.storeRegionEntity.clear();
  //   this.logger.log('Store data cleared successfully');
  // }
}
