import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRecordDto {
  @IsNotEmpty()
  @IsNumber()
  drawNumber: number;

  @IsNotEmpty()
  @IsArray()
  combinations: number[][];

  @IsNotEmpty()
  @IsDateString()
  purchaseDate: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsString()
  transactionId: string;
}
