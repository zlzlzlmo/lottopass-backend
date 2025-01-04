import { DetailDraw } from 'lottopass-shared';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('detail_draw')
export class DetailDrawEntity implements DetailDraw {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  drawNumber: number;

  @Column()
  rank: number;

  @Column('bigint')
  totalPrize: number;

  @Column()
  winnerCount: number;

  @Column('bigint')
  prizePerWinner: number;
}
