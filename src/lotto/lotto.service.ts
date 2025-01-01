import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { LottoDrawEntity } from './lotto-draw.entity';

@Injectable()
export class LottoService {
  private readonly lottoApiUrl =
    'https://www.dhlottery.co.kr/common.do?method=getLottoNumber';

  constructor(
    @InjectRepository(LottoDrawEntity)
    private readonly lottoRepository: Repository<LottoDrawEntity>,
  ) {}

  // 단일 회차 데이터 가져오기
  async fetchLottoDraw(drawNumber: number): Promise<LottoDrawEntity> {
    const cachedData = await this.lottoRepository.findOneBy({ drawNumber });
    if (cachedData) return cachedData;

    const response = await axios.get(`${this.lottoApiUrl}&drwNo=${drawNumber}`);
    if (response.data.returnValue === 'fail') {
      throw new Error(`Invalid draw number: ${drawNumber}`);
    }

    const mappedData: LottoDrawEntity = this.lottoRepository.create({
      drawNumber: response.data.drwNo,
      date: response.data.drwNoDate,
      winningNumbers: [
        response.data.drwtNo1,
        response.data.drwtNo2,
        response.data.drwtNo3,
        response.data.drwtNo4,
        response.data.drwtNo5,
        response.data.drwtNo6,
      ],
      bonusNumber: response.data.bnusNo,
      prizeStatistics: {
        totalPrize: response.data.totSellamnt,
        firstWinAmount: response.data.firstWinamnt,
        firstAccumAmount: response.data.firstAccumamnt,
        firstPrizeWinnerCount: response.data.firstPrzwnerCo,
      },
    });

    await this.lottoRepository.save(mappedData);
    return mappedData;
  }

  // 여러 회차 데이터 가져오기
  async fetchLottoDraws(drawNumbers: number[]): Promise<LottoDrawEntity[]> {

    const results = await this.lottoRepository.find({
      order: { drawNumber: 'ASC' },
    });

    const missingDrawNumbers = drawNumbers.filter(
      (number) => !results.some((result) => result.drawNumber === number),
    );
  
    if (missingDrawNumbers.length > 0) {
      
      const missingData = await Promise.all(
        missingDrawNumbers.map((drawNumber) => this.fetchLottoDraw(drawNumber)),
      );
      results.push(...missingData);
    }
  
    return results;
  }

  // 최신 회차 번호 가져오기
  async getLatestRound(): Promise<number> {
    // 데이터베이스에서 최신 회차 번호 조회
    const latestStoredDraw = await this.lottoRepository.find({
      order: { drawNumber: 'DESC' }, // 최신 회차 번호 기준으로 정렬
      take: 1, // 가장 최신 데이터 한 건만 가져오기
    });
  
    // 저장된 최신 회차 번호가 없으면 초기값으로 1000 설정
    const latestDrawNumber = latestStoredDraw.length > 0 ? latestStoredDraw[0].drawNumber : 1000;
  
    console.log(`Latest stored draw number: ${latestDrawNumber}`);
  
    let round = latestDrawNumber;
  
    // 최신 데이터 이후 회차 번호 확인
    while (true) {
      const response = await axios.get(`${this.lottoApiUrl}&drwNo=${round + 1}`);
      if (response.data.returnValue === 'fail') break;
      round++;
    }
  
    return round; // 최신 회차 번호 반환
  }  
}

