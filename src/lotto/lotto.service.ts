import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import { Cron } from '@nestjs/schedule';
import { LottoDrawEntity } from './lotto-draw.entity';

@Injectable()
export class LottoService {
  private readonly logger = new Logger(LottoService.name);
  private readonly lottoApiUrl =
    'https://www.dhlottery.co.kr/common.do?method=getLottoNumber';
  private readonly maxRetryAttempts = 3;
  private readonly retryDelay = 3000; // 3초 대기
  private readonly apiClient: AxiosInstance;

  constructor(
    @InjectRepository(LottoDrawEntity)
    private readonly lottoRepository: Repository<LottoDrawEntity>
  ) {
    this.apiClient = axios.create({
      timeout: 5000, // 요청 타임아웃 5초
    });
  }

  // 단일 회차 데이터 가져오기
  async fetchLottoDraw(drawNumber: number): Promise<LottoDrawEntity> {
    const existingData = await this.lottoRepository.findOneBy({ drawNumber });
    if (existingData) return existingData;

    try {
      const response = await this.apiClient.get(
        `${this.lottoApiUrl}&drwNo=${drawNumber}`
      );
      if (response.data.returnValue === 'fail') {
        throw new Error(`Invalid draw number: ${drawNumber}`);
      }

      const mappedData = this.mapApiResponseToEntity(response.data);
      await this.lottoRepository.save(mappedData);
      return mappedData;
    } catch (error) {
      this.handleApiError(error, `Failed to fetch draw number ${drawNumber}`);
      throw error;
    }
  }

  // 모든 회차 데이터 가져오기
  async fetchAllLottoDraws(): Promise<LottoDrawEntity[]> {
    return this.lottoRepository.find({
      order: { drawNumber: 'ASC' },
    });
  }

  // 최신 회차 번호 가져오기
  async getLatestRound(): Promise<number> {
    const results = await this.lottoRepository.find({
      order: { drawNumber: 'DESC' },
      take: 1,
    });

    return results[0].drawNumber;
  }

  // 최신 데이터 가져오기 및 저장
  async fetchAndSaveLatestRound(): Promise<void> {
    const latestStoredDraw = await this.lottoRepository.findOne({
      order: { drawNumber: 'DESC' },
    });

    const latestDrawNumber = latestStoredDraw ? latestStoredDraw.drawNumber : 0;

    let attempt = 0;
    while (attempt < this.maxRetryAttempts) {
      try {
        const response = await this.apiClient.get(
          `${this.lottoApiUrl}&drwNo=${latestDrawNumber + 1}`
        );
        if (response.data.returnValue === 'fail') {
          this.logger.log('No new draw available yet.');
          return;
        }

        const mappedData = this.mapApiResponseToEntity(response.data);
        await this.lottoRepository.save(mappedData);
        this.logger.log(`Saved latest draw: ${response.data.drwNo}`);
        return;
      } catch (error) {
        attempt++;
        this.handleApiError(
          error,
          `Attempt ${attempt}: Failed to fetch latest draw`
        );
        if (attempt >= this.maxRetryAttempts) {
          this.logger.error('Max retry attempts reached. Aborting...');
          return;
        }
        await this.delay(this.retryDelay); // 대기 후 재시도
      }
    }
  }

  // 매주 토요일 오후 9시에 최신 데이터 업데이트
  @Cron('0 21 * * 6')
  async handleScheduledTask(): Promise<void> {
    this.logger.log('Running scheduled task to fetch latest Lotto draw...');
    await this.fetchAndSaveLatestRound();
  }

  // API 응답을 데이터베이스 엔티티로 매핑
  private mapApiResponseToEntity(data: any): LottoDrawEntity {
    return this.lottoRepository.create({
      drawNumber: data.drwNo,
      date: data.drwNoDate,
      winningNumbers: [
        data.drwtNo1,
        data.drwtNo2,
        data.drwtNo3,
        data.drwtNo4,
        data.drwtNo5,
        data.drwtNo6,
      ],
      bonusNumber: data.bnusNo,
      prizeStatistics: {
        totalPrize: data.totSellamnt,
        firstWinAmount: data.firstWinamnt,
        firstAccumAmount: data.firstAccumamnt,
        firstPrizeWinnerCount: data.firstPrzwnerCo,
      },
    });
  }

  // API 요청 실패 시 에러 처리
  private handleApiError(error: any, contextMessage: string): void {
    if (error instanceof Error) {
      this.logger.error(`${contextMessage}: ${error.message}`);
    } else {
      this.logger.error(`${contextMessage}: Unknown error occurred`);
    }
  }

  // 딜레이 함수
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
