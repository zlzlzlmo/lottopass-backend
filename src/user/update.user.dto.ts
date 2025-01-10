import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Matches(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, {
    message: '유효한 이메일 형식이 아닙니다.',
  })
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z가-힣0-9]{2,10}$/, {
    message: '닉네임은 2~10자리 영문/한글/숫자만 가능합니다.',
  })
  nickname?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      '비밀번호는 최소 8자 이상, 문자, 숫자, 특수문자를 포함해야 합니다.',
  })
  password?: string;
}
