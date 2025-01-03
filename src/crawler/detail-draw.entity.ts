import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('detail_draw')
export class DetailDrawEntity {
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
