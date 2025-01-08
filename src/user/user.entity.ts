// src/user/user.entity.ts
import { LottoCombinationEntity } from 'src/lotto-combination/lotto-combination.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  provider: string;

  @OneToMany(
    () => LottoCombinationEntity,
    (lottoCombination) => lottoCombination.user,
    {
      cascade: true,
    }
  )
  lottoCombinations: LottoCombinationEntity[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
