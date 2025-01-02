import { UniqueRegion } from 'lottopass-shared';
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('unique_regions')
@Unique(['province', 'city'])
export class UniqueRegionEntity implements UniqueRegion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  province: string;

  @Column()
  city: string;
}
