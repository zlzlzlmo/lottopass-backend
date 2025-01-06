import { StoreInfo } from 'lottopass-shared';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('store')
export class StoreRegionEntity implements StoreInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_address', type: 'text' })
  fullAddress: string;

  @Column({ type: 'text' })
  province: string;

  @Column({ type: 'text' })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ name: 'store_name', type: 'varchar', length: 255 })
  storeName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;
}
