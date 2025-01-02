import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('winning_regions')
export class WinningRegionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  drawNumber: number;

  @Column()
  province: string; // 도/광역시

  @Column()
  city: string; // 시/구

  @Column()
  district: string; // 동/읍/면

  @Column()
  storeName: string;

  @Column({ type: 'varchar', nullable: true })
  method: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'json', nullable: true })
  coordinates: { lat: number; lng: number };

  @Column({ type: 'varchar', unique: true })
  uniqueIdentifier: string;
}
