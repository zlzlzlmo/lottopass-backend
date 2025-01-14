import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetailDrawEntity } from './detail-draw.entity';
import * as cheerio from 'cheerio';
import axios from 'axios';
import * as iconv from 'iconv-lite';
import { WinningRegionEntity } from 'src/region/winning-region.entity';
import { getCoordinatesAndRegionFromKakao } from 'src/utils/kakaoGeocode';
import { UniqueRegionEntity } from 'src/region/unique-region.entity';
import { getLocalIp, getPublicIp } from 'src/utils/ip';
import { StoreInfo } from 'lottopass-shared';
import { StoreRegionEntity } from 'src/region/store-region.entity';
import { decodeCustom } from 'src/utils/decode';

@Injectable()
export class CrawlerService {
  constructor(
    @InjectRepository(DetailDrawEntity)
    private readonly detailDrawRepository: Repository<DetailDrawEntity>,
    @InjectRepository(WinningRegionEntity)
    private readonly winningRegionRepository: Repository<WinningRegionEntity>,
    @InjectRepository(UniqueRegionEntity)
    private readonly uniqueRegionRepository: Repository<UniqueRegionEntity>
  ) {}

  // 로또 지역별 판매점 크롤링
  async crawlLottoStores(
    province: string,
    city?: string
  ): Promise<({ province: string; city: string } & StoreInfo)[]> {
    let currentPage = 1;
    const allResults: ({ province: string; city: string } & StoreInfo)[] = [];
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
        if (result.totalPage === 0) return [] as any;
        if (result.arr && result.arr.length > 0) {
          try {
            const processedData = result.arr.map((store: any) => {
              const fullAddress =
                store.BPLCDORODTLADRES ||
                `${store.BPLCLOCPLC1} ${store.BPLCLOCPLC2} ${store.BPLCLOCPLC3} ${store.BPLCLOCPLCDTLADRES}`;

              return {
                province,
                city: city || '',
                fullAddress: decodeCustom(fullAddress.trim()),
                latitude: store.LATITUDE,
                longitude: store.LONGITUDE,
                storeName: decodeCustom(store.FIRMNM),
                phone: store.RTLRSTRTELNO || null,
              };
            });

            allResults.push(...processedData);
          } catch (error) {
            console.error('Error in map function:', error);
          }
        } else {
          console.log('result.arr is missing or empty.');
        }

        if (result.nowPage === result.pageEnd) break;
        currentPage += 1;
      }
    } catch (error) {
      throw new Error('Failed to fetch lotto store data');
    }

    return allResults;
  }

  async crawlFirstPrize(
    drawNumber: number
  ): Promise<WinningRegionEntity[] | null> {
    const BASE_URL =
      'https://www.dhlottery.co.kr/store.do?method=topStore&pageGubun=L645';
    const url = `${BASE_URL}&drwNo=${drawNumber}`;
    const html = await this.fetchPage(url);

    const pageData = await this.parseFirstPrizePage(
      html,
      drawNumber.toString()
    );

    if (pageData.length === 0) {
      return null; // 명확히 반환
    }

    // 이미 존재하는 uniqueIdentifier들을 한 번에 쿼리
    const existingIdentifiers = await this.winningRegionRepository.find({
      where: pageData.map((entry) => ({
        uniqueIdentifier: this.setUniqueIdentifier(
          entry.drawNumber,
          entry.storeName
        ),
      })),
    });

    // 메모리에서 존재 여부 확인
    const existingSet = new Set(
      existingIdentifiers.map((e) => e.uniqueIdentifier)
    );

    const savedRecords: WinningRegionEntity[] = [];

    for (const entry of pageData) {
      const identifier = this.setUniqueIdentifier(
        entry.drawNumber,
        entry.storeName
      );
      if (!existingSet.has(identifier)) {
        const newRecord = this.winningRegionRepository.create(entry);
        const savedRecord = await this.winningRegionRepository.save(newRecord);
        savedRecords.push(savedRecord);
      }
    }

    return savedRecords.length > 0 ? savedRecords : null;
  }

  // 회차별 당첨번호 상세 데이터 가져오기
  async fetchDrawData(drawNumber: number): Promise<DetailDrawEntity[]> {
    try {
      const existingData = await this.detailDrawRepository.find({
        where: { drawNumber },
      });

      if (existingData[0].prizePerWinner > 0 && existingData.length > 0) {
        return existingData;
      }

      const BASE_URL = 'https://www.dhlottery.co.kr/gameResult.do?method=byWin';
      const url = `${BASE_URL}&drwNo=${drawNumber}`;
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);
      const prizes: Partial<DetailDrawEntity>[] = [];

      // 순위별 정보 추출
      $('#article > div:nth-child(2) > div > table > tbody > tr').each(
        (index, element) => {
          const rank = parseInt(
            $(element).find('td:nth-child(1)').text().trim().replace('등', '')
          );
          const totalPrize = parseInt(
            $(element)
              .find('td:nth-child(2)')
              .text()
              .trim()
              .replace(/[^0-9]/g, '')
          );
          const winnerCount = parseInt(
            $(element)
              .find('td:nth-child(3)')
              .text()
              .trim()
              .replace(/[^0-9]/g, '')
          );
          const prizePerWinner = parseInt(
            $(element)
              .find('td:nth-child(4)')
              .text()
              .trim()
              .replace(/[^0-9]/g, '')
          );

          prizes.push({
            drawNumber,
            rank,
            totalPrize,
            winnerCount,
            prizePerWinner,
          });
        }
      );

      const savedData = await this.detailDrawRepository.save(prizes);

      return savedData;
    } catch (error) {
      return [];
    }
  }

  private async fetchPage(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return iconv.decode(response.data, 'euc-kr');
  }

  // 1등 배출점 디비에 넣기 위한 데이터로 파싱 후 리턴
  private async parseFirstPrizePage(
    html: string,
    drawNumber: string
  ): Promise<Partial<WinningRegionEntity>[]> {
    const $ = cheerio.load(html);
    const data: Partial<WinningRegionEntity>[] = [];

    const firstPrizeTable = $(
      '.group_content .group_title:contains("1등 배출점")'
    ).next('table');
    console.log('firstPrizeTable : ', firstPrizeTable);

    for (const row of firstPrizeTable.find('tbody tr')) {
      const name = $(row).find('td:nth-child(2)').text().trim();
      const method = $(row).find('td:nth-child(3)').text().trim();
      const address = $(row).find('td:nth-child(4)').text().trim();

      if (name && method && address) {
        try {
          const result = await getCoordinatesAndRegionFromKakao(address);

          if (result) {
            // Unique region 추가 확인
            await this.ensureUniqueRegion(
              result.region.province,
              result.region.city
            );

            data.push({
              drawNumber: parseInt(drawNumber),
              storeName: name,
              method,
              address,
              province: result.region.province,
              city: result.region.city,
              district: result.region.district,
              coordinates: result.coordinates,
              uniqueIdentifier: this.setUniqueIdentifier(
                parseInt(drawNumber),
                name
              ),
            });
          }
        } catch (error: any) {
          // IP 가져오기
          const localIps = getLocalIp().join(', ');
          const publicIp = await getPublicIp();

          // 실패 로그 출력
          console.error(
            `Failed to fetch coordinates for address: ${address}.`,
            `Local IPs: ${localIps}`,
            `Public IP: ${publicIp}`,
            `Error: ${error.message || error}`
          );
          // 오류 발생 시 데이터를 스킵
        }
      }
    }

    return data;
  }

  // DB에 없는 완전 새로운 지역에서 당첨 배출점이 나오면 확인 후 save
  private async ensureUniqueRegion(
    province: string,
    city: string
  ): Promise<void> {
    const exists = await this.uniqueRegionRepository.findOne({
      where: { province, city },
    });

    if (!exists) {
      const newRegion = this.uniqueRegionRepository.create({ province, city });
      await this.uniqueRegionRepository.save(newRegion);
    }
  }

  private setUniqueIdentifier(drawNumber: number, store: string) {
    return `${drawNumber}${store}`;
  }
}
