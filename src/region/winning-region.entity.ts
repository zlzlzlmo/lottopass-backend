import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UniqueRegionEntity } from './unique-region.entitiy';

@Entity('winning_regions')
export class WinningRegionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  drawNumber: number;

  @Column()
  storeName: string;

  @Column()
  province: string;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column({ type: 'varchar', nullable: true })
  method: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'json', nullable: true })
  coordinates: { lat: number; lng: number };

  @Column({ type: 'varchar', unique: true })
  uniqueIdentifier: string;

  @ManyToOne(() => UniqueRegionEntity)
  @JoinColumn({ name: 'unique_region_id' })
  uniqueRegion: UniqueRegionEntity;
}
