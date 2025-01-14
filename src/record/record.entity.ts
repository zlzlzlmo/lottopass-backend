// src/records/entities/record.entity.ts
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('record')
export class RecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.records, { nullable: false })
  user: UserEntity;

  @Column()
  drawNumber: number;

  @Column()
  transactionId: string;

  @Column('json')
  combinations: number[][];

  @Column({ type: 'date' })
  purchaseDate: string;

  @Column({ type: 'text', nullable: true })
  memo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
