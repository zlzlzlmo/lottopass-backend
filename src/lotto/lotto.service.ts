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
    // 1. 데이터베이스에서 해당 회차 데이터 조회
    const cachedData = await this.lottoRepository.findOneBy({ drawNumber });
    if (cachedData) {
      console.log(`Cache hit for draw number: ${drawNumber}`);
      return cachedData; // 데이터베이스에 있으면 반환
    }
  
    // 2. 데이터베이스에 없으면 외부 API에서 데이터 가져오기
    const response = await axios.get(`${this.lottoApiUrl}&drwNo=${drawNumber}`);
  
    if (response.data.returnValue === 'fail') {
      throw new Error(`Invalid draw number: ${drawNumber}`);
    }
  
    // 3. 가져온 데이터를 엔티티로 매핑
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
  
    // 4. 데이터베이스에 저장
    await this.lottoRepository.save(mappedData);
    return mappedData; // 저장된 데이터를 반환
  }
      
  // 여러 회차 데이터 가져오기
  async fetchLottoDraws(drawNumbers: number[]): Promise<LottoDrawEntity[]> {
    const results: LottoDrawEntity[] = [];

    for (const drawNumber of drawNumbers) {
      const data = await this.fetchLottoDraw(drawNumber);
      results.push(data);
    }

    return results;
  }

  // 최신 회차 번호 가져오기
  async getLatestRound(): Promise<number> {
    let round = 1000; // 시작 회차
    while (true) {
      const response = await axios.get(`${this.lottoApiUrl}&drwNo=${round + 1}`);
      if (response.data.returnValue === 'fail') break;
      round++;
    }
    return round;
  }
}
