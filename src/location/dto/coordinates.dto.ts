import { IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinatesDto {
  @Type(() => Number) // 문자열을 숫자로 변환
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
