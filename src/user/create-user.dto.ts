import {
  IsString,
  IsInt,
  IsIn,
  IsNotEmpty,
  Length,
  Matches,
  IsNumber,
  Max,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]{4,12}$/, {
    message: '아이디는 4~12자리 영문과 숫자만 가능합니다.',
  })
  loginId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).{10,12}$/, {
    message: '비밀번호는 10~12자리 영문과 숫자를 조합해야 합니다.',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[가-힣]{2,5}$/, {
    message: '이름은 한글 2~5자 이내로 입력해주세요.',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z가-힣0-9]{2,10}$/, {
    message: '닉네임은 2~10자리 영문/한글/숫자만 가능합니다.',
  })
  nickname: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  birthYear: number;

  @IsInt()
  birthMonth: number;

  @IsInt()
  birthDay: number;

  @IsIn(['male', 'female', 'other'])
  gender: string;
}
