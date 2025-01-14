import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { LottoDraw } from 'lottopass-shared';
import { LottoDrawEntity } from './lotto-draw.entity';

@Injectable()
export class DrawService {
  private readonly lottto_API_URL =
    'https://www.dhlottery.co.kr/common.do?method=getLottoNumber';
  constructor(
    @InjectRepository(LottoDrawEntity)
    private readonly lottoRepository: Repository<LottoDrawEntity>
  ) {}

  async fetchOneDraw(drawNumber: number): Promise<LottoDrawEntity> {
    if (isNaN(Number(drawNumber)))
      throw new Error('Non proper drawNumber Type');
    return await this.lottoRepository.findOne({
      where: {
        drawNumber,
      },
    });
  }

  async fetchAllDraws(): Promise<LottoDrawEntity[]> {
    const draws = await this.lottoRepository.find({
      order: { drawNumber: 'DESC' },
    });

    return draws.map((draw) => ({
      ...draw,
      winningNumbers: draw.winningNumbers.map(Number),
    }));
  }

  async fetchLatestDraw(): Promise<LottoDraw> {
    const latestDrawFromDB = await this.lottoRepository.findOne({
      where: {},
      order: { drawNumber: 'DESC' },
    });

    const latestDrawNumber = latestDrawFromDB ? latestDrawFromDB.drawNumber : 0;

    try {
      const response = await axios.get(
        `${this.lottto_API_URL}&drwNo=${latestDrawNumber + 1}`
      );

      if (response.data.returnValue === 'fail') return latestDrawFromDB;

      const mappedData = this.mapApiResponseToEntity(response.data);

      return await this.lottoRepository.save(mappedData);
    } catch (error) {
      return latestDrawFromDB;
    }
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
}
