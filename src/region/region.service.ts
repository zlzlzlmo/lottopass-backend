import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinningRegionEntity } from './winning-region.entity';
import { UniqueRegionEntity } from './unique-region.entity';
import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

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

  async fetchAllPages(province: string): Promise<any[]> {
    let currentPage = 1;
    const allResults = [];
    const BASE_URL =
      'https://dhlottery.co.kr/store.do?method=sellerInfo645Result';

    try {
      while (true) {
        console.log('pro : ', province);
        const formData = new URLSearchParams();
        formData.append('searchType', '1');
        formData.append('sltSIDO', province); // 도/시
        formData.append('sltGUGUN', ''); // 시/구 (필요 시 추가)
        formData.append('nowPage', currentPage.toString());

        const response = await axios.post(BASE_URL, formData.toString(), {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        });

        const decodedData = iconv.decode(Buffer.from(response.data), 'EUC-KR');
        const result = JSON.parse(decodedData);
        console.log('Res dafasd : ', result);
        if (result.arr && result.arr.length > 0) {
          allResults.push(...result.arr);
        }
        console.log('asdfsadfsaxx');
        if (!result.pageIsNext) {
          break; // 다음 페이지가 없으면 종료
        }

        currentPage++;
      }

      return allResults;
    } catch (error) {
      // console.error('Error fetching lotto store data:', error.message);
      throw new Error('Failed to fetch lotto store data');
    }
  }
}
