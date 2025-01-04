import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinningRegionEntity } from './winning-region.entity';
import { UniqueRegionEntity } from './unique-region.entity';
import axios from 'axios';

import iconv from 'iconv-lite';
interface StoreInfo {
  fullAddress: string;
  latitude: number;
  longitude: number;
  storeName: string;
  phone: string | null;
}

const decodeCustom = (text: string) => {
  return text
    .replace(/&&#35;40;/g, '(') // "&&#35;40;" → "("
    .replace(/&&#35;41;/g, ')'); // "&&#35;41;" → ")"
};

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

  async getTest(province: string, city?: string, page = 1) {
    const BASE_URL =
      'https://dhlottery.co.kr/store.do?method=sellerInfo645Result';
    console.log('Testssad');
    try {
      const formData = new URLSearchParams();
      formData.append('searchType', '1'); // 검색 유형
      formData.append('sltSIDO', '경기'); // 도/시
      formData.append('sltGUGUN', ''); // 시/구
      formData.append('nowPage', '1'); // 페이지 번호

      const response = await axios.post(BASE_URL, formData.toString(), {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      });

      console.log('res : ', response.data);
      // 응답 데이터를 EUC-KR에서 UTF-8로 변환
      const decodedData = iconv.decode(Buffer.from(response.data), 'EUC-KR');

      // JSON 파싱
      const result = JSON.parse(decodedData);
      console.log('Decoded Result:', result);

      return result;
    } catch (error) {
      console.error(`Error fetching stores for ${province} ${city}:`, error);
      throw new Error('Failed to fetch store data');
    }
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
        formData.append('sltSIDO', province); // 도/시
        formData.append('sltGUGUN', city ?? ''); // 시/구
        formData.append('nowPage', currentPage.toString()); // 현재 페이지

        const response = await axios.post(BASE_URL, formData.toString(), {
          responseType: 'arraybuffer', // 데이터를 버퍼로 수신
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        });

        const decodedData = iconv.decode(Buffer.from(response.data), 'EUC-KR');
        const result = JSON.parse(decodedData);

        if (result.totalPage === 0) return []; // 결과가 없으면 빈 배열 반환
        if (result.arr && result.arr.length > 0) {
          const processedData = result.arr.map((store: any) => {
            const fullAddress =
              store.BPLCDORODTLADRES || // 도로명 주소가 있으면 사용
              `${store.BPLCLOCPLC1} ${store.BPLCLOCPLC2} ${store.BPLCLOCPLC3} ${store.BPLCLOCPLCDTLADRES}`; // 풀네임 주소 구성

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

        if (result.nowPage === result.pageEnd) break; // 마지막 페이지라면 종료
        currentPage += 1;
      }

      return allResults;
    } catch (error) {
      throw new Error('Failed to fetch lotto store data');
    }
  }
}
