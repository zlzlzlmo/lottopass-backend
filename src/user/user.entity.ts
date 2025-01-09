import { LottoCombinationEntity } from 'src/lotto-combination/lotto-combination.entity';
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
  phoneNumber: string;

  @Column({ type: 'varchar', unique: true })
  loginId: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  nickname: string;

  @Column({ type: 'int' })
  birthYear: number;

  @Column({ type: 'int' })
  birthMonth: number;

  @Column({ type: 'int' })
  birthDay: number;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'] })
  gender: string;

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
}
