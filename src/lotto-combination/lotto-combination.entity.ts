import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('lotto_combination')
export class LottoCombinationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-array')
  combination: number[];

  @ManyToOne(() => UserEntity, (user) => user.lottoCombinations, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;
}
