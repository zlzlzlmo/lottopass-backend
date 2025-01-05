import { IsInt, IsNotEmpty } from 'class-validator';

export class WinningRegionDto {
  @IsInt()
  @IsNotEmpty({ message: 'Draw number is required' })
  drawNumber: number;
}
