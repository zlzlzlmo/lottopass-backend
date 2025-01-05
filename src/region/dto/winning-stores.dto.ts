import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WinningAllStoresDto {
  @IsString()
  @IsNotEmpty({ message: 'Province parameter is required.' })
  province: string;

  @IsString()
  @IsOptional()
  city?: string;
}
