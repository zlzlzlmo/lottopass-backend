import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, {
    message: '유효한 이메일 형식이 아닙니다.',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      '비밀번호는 최소 8자 이상, 문자, 숫자, 특수문자를 포함해야 합니다.',
  })
  password: string;
}
