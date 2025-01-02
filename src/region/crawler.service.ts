import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import * as iconv from 'iconv-lite';
import { getCoordinatesAndRegionFromKakao } from 'src/utils/kakaoGeocode';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinningRegionEntity } from './winning-region.entity'; // 엔티티 경로
import { LottoService } from 'src/lotto/lotto.service';
import { Cron } from '@nestjs/schedule';
import { UniqueRegionEntity } from './unique-region.entitiy';

@Injectable()
export class LottoCrawlerService {
  private readonly lottoCrawlUrl =
    'https://www.dhlottery.co.kr/store.do?method=topStore&pageGubun=L645';

  constructor(
    @InjectRepository(WinningRegionEntity)
    private readonly winningRegionRepository: Repository<WinningRegionEntity>,
    @InjectRepository(UniqueRegionEntity)
    private readonly uniqueRegionRepository: Repository<UniqueRegionEntity>,
    private readonly lottoService: LottoService
  ) {}

  async fetchPage(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const decodedData = iconv.decode(response.data, 'euc-kr');
    return decodedData;
  }

  async parseFirstPrizePage(
    html: string,
    drawNumber: string
  ): Promise<Partial<WinningRegionEntity>[]> {
    const $ = cheerio.load(html);
    const data: Partial<WinningRegionEntity>[] = [];

    const firstPrizeTable = $(
      '.group_content .group_title:contains("1등 배출점")'
    ).next('table');

    for (const row of firstPrizeTable.find('tbody tr')) {
      const name = $(row).find('td:nth-child(2)').text().trim();
      const method = $(row).find('td:nth-child(3)').text().trim();
      const address = $(row).find('td:nth-child(4)').text().trim();

      if (name && method && address) {
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
      }
    }

    return data;
  }

  async ensureUniqueRegion(province: string, city: string): Promise<void> {
    const exists = await this.uniqueRegionRepository.findOne({
      where: { province, city },
    });

    if (!exists) {
      const newRegion = this.uniqueRegionRepository.create({ province, city });
      await this.uniqueRegionRepository.save(newRegion);
    }
  }

  async crawlFirstPrize(drawNumber: number): Promise<WinningRegionEntity> {
    const url = `${this.lottoCrawlUrl}&drwNo=${drawNumber}`;
    const html = await this.fetchPage(url);
    const pageData = await this.parseFirstPrizePage(
      html,
      drawNumber.toString()
    );

    if (pageData.length > 0) {
      for (const entry of pageData) {
        const exists = await this.winningRegionRepository.findOne({
          where: {
            uniqueIdentifier: this.setUniqueIdentifier(
              entry.drawNumber,
              entry.storeName
            ),
          },
        });

        if (!exists) {
          const newRecord = this.winningRegionRepository.create(entry);
          await this.winningRegionRepository.save(newRecord);
          return newRecord;
        }
      }
    }
  }

  // 매주 토요일 오후 9시에 실행
  @Cron('0 21 * * 6')
  async scheduleCrawl(): Promise<void> {
    const latestDrawNumber = await this.lottoService.getLatestRound();
    if (!latestDrawNumber) return;

    await this.crawlFirstPrize(latestDrawNumber);
  }

  setUniqueIdentifier(drawNumber: number, store: string) {
    return `${drawNumber}${store}`;
  }
}
