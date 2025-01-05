import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinningRegionEntity } from './winning-region.entity';
import { UniqueRegionEntity } from './unique-region.entity';
import axios from 'axios';

import iconv from 'iconv-lite';
import { StoreInfo } from 'lottopass-shared';

const decodeCustom = (text: string) => {
  return text.replace(/&&#35;40;/g, '(').replace(/&&#35;41;/g, ')');
};

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(WinningRegionEntity)
    private readonly winningRegionRepository: Repository<WinningRegionEntity>,
    @InjectRepository(UniqueRegionEntity)
    private readonly uniqueRegionRepository: Repository<UniqueRegionEntity>
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
    return await this.uniqueRegionRepository.find();
  }

  async fetchAllStores(province: string, city?: string): Promise<StoreInfo[]> {
    let currentPage = 1;
    const allResults: StoreInfo[] = [];
    const BASE_URL =
      'https://dhlottery.co.kr/store.do?method=sellerInfo645Result';

    try {
      while (true) {
        const formData = new URLSearchParams();
        formData.append('searchType', '1');
        formData.append('sltSIDO', province);
        formData.append('sltGUGUN', city ?? '');
        formData.append('nowPage', currentPage.toString());

        const response = await axios.post(BASE_URL, formData.toString(), {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        });

        const decodedData = iconv.decode(Buffer.from(response.data), 'EUC-KR');
        const result = JSON.parse(decodedData);

        if (result.totalPage === 0) return [];
        if (result.arr && result.arr.length > 0) {
          const processedData = result.arr.map((store: any) => {
            const fullAddress =
              store.BPLCDORODTLADRES ||
              `${store.BPLCLOCPLC1} ${store.BPLCLOCPLC2} ${store.BPLCLOCPLC3} ${store.BPLCLOCPLCDTLADRES}`;

            return {
              fullAddress: fullAddress.trim(),
              latitude: store.LATITUDE,
              longitude: store.LONGITUDE,
              storeName: decodeCustom(store.FIRMNM),
              phone: store.RTLRSTRTELNO || null,
            };
          });

          allResults.push(...processedData);
        }

        if (result.nowPage === result.pageEnd) break;
        currentPage += 1;
      }

      return allResults;
    } catch (error) {
      throw new Error('Failed to fetch lotto store data');
    }
  }
}
