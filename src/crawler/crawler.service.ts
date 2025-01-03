import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetailDrawEntity } from './detail-draw.entity';
import * as cheerio from 'cheerio';
import axios from 'axios';
import * as iconv from 'iconv-lite';

@Injectable()
export class CrawlerService {
  constructor(
    @InjectRepository(DetailDrawEntity)
    private readonly detailDrawRepository: Repository<DetailDrawEntity>
  ) {}

  async fetchDrawData(drawNumber: number): Promise<DetailDrawEntity[]> {
    try {
      const existingData = await this.detailDrawRepository.find({
        where: { drawNumber },
      });

      if (existingData.length > 0) {
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
}
