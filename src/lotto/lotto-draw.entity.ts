import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('lotto_draws')
export class LottoDrawEntity {
  @PrimaryColumn()
  drawNumber: number;

  @Column()
  date: string;

  @Column('simple-array')
  winningNumbers: number[];

  @Column()
  bonusNumber: number;

  @Column('json', { nullable: true })
  prizeStatistics: {
    totalPrize: number;
    firstWinAmount: number;
    firstAccumAmount: number;
    firstPrizeWinnerCount: number;
  };
}