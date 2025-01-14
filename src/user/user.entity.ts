import { LottoCombinationEntity } from 'src/lotto-combination/lotto-combination.entity';
import { RecordEntity } from 'src/record/record.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', unique: true })
  nickname: string;

  @Column({ type: 'varchar' })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(
    () => LottoCombinationEntity,
    (lottoCombination) => lottoCombination.user,
    {
      cascade: true,
    }
  )
  lottoCombinations: LottoCombinationEntity[];

  @OneToMany(() => RecordEntity, (record) => record.user, {
    cascade: true,
  })
  records: RecordEntity[];
}
