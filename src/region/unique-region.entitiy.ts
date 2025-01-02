import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('unique_regions')
@Unique(['province', 'city'])
export class UniqueRegionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  province: string;

  @Column()
  city: string;
}
