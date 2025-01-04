import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetailDrawEntity } from './detail-draw.entity';
import * as cheerio from 'cheerio';
import axios from 'axios';
import * as iconv from 'iconv-lite';
import * as puppeteer from 'puppeteer';

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

  async crawlStores(province: string): Promise<any[]> {
    const url = 'https://dhlottery.co.kr/store.do?method=sellerInfo645#';

    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    page.on('console', (msg) => {
      for (let i = 0; i < msg.args().length; ++i) {
        console.log(`${i}: ${msg.args()[i]}`);
      }
    });
    // 지역 이름 클릭 (menu)
    await page.evaluate((province) => {
      console.log('province: ', province);
      const menu = Array.from(
        document.querySelectorAll('#mainMenuArea a')
      ).find((el) => el.textContent?.trim() === province);
      if (menu) {
        (menu as HTMLElement).click();
      }
    }, province);
    console.log('1');

    // Wait for the table to refresh
    await page.waitForSelector('#resultTable tbody tr', { timeout: 10000 });

    const scrapeTableData = async () => {
      return await page.evaluate(() => {
        const rows = document.querySelectorAll('#resultTable tbody tr');
        const data = [];
        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          data.push({
            province: cells[0]?.textContent?.trim() || '',
            city: cells[1]?.textContent?.trim() || '',
            district: cells[2]?.textContent?.trim() || '',
            storeName: cells[3]?.textContent?.trim() || '',
            address: cells[4]?.textContent?.trim() || '',
            contact: cells[5]?.textContent?.trim() || '',
          });
        });
        return data;
      });
    };

    // 모든 페이지 데이터 수집
    let stores = [];
    let hasNextPage = true;

    while (hasNextPage) {
      // 현재 페이지 데이터 크롤링
      const currentPageData = await scrapeTableData();
      stores = [...stores, ...currentPageData];

      // 다음 페이지 버튼 클릭
      hasNextPage = await page.evaluate(() => {
        const nextPage = document.querySelector('#pagingView .next');
        if (nextPage && !nextPage.classList.contains('disabled')) {
          (nextPage as HTMLElement).click();
          return true;
        }
        return false;
      });

      if (hasNextPage) {
        // 다음 페이지의 데이터 로드를 대기
        await page.waitForSelector('#resultTable tbody tr', { timeout: 10000 });
      }
    }

    await browser.close();
    return stores;
  }

  private async fetchPage(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return iconv.decode(response.data, 'euc-kr');
  }
}
