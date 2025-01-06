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
    const regions = await this.uniqueRegionRepository
      .createQueryBuilder('region')
      .select([
        'region.id As id',
        'SUBSTRING(region.province, 1, 2) AS province', // province의 첫 두 글자만 가져옴
        'region.city As city',
      ])
      .getRawMany();

    return regions.map((region) => ({
      ...region,
      province: region.province, // 매핑된 province 사용
    })) as UniqueRegionEntity[];
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
        formData.append('sltSIDO', province.substring(0, 2));
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
              fullAddress: decodeCustom(fullAddress.trim()),
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
