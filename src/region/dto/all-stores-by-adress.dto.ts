import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class AllStoresByAdressDto {
  @IsString()
  @IsNotEmpty({ message: 'Province is required' })
  province: string;

  @IsString()
  @IsOptional()
  city?: string;
}
