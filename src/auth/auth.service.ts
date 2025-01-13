import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { LoginDto } from 'src/user/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  generateJwtToken(
    user: Pick<UserEntity, 'id' | 'email' | 'nickname'>
  ): string {
    const payload = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    };

    try {
      return this.jwtService.sign(payload);
    } catch (error: any) {
      console.error('JWT 생성 중 에러 발생:', {
        payload,
        error: error.message,
      });
      throw new Error(`JWT 생성 실패: ${error.message}`);
    }
  }

  async login(loginDto: LoginDto): Promise<string> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.'
      );
    }

    try {
      const token = this.generateJwtToken({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      });

      return token;
    } catch (error) {
      console.error('Error signing JWT:', error);
      throw new Error('JWT 생성 중 문제가 발생했습니다.');
    }
  }

  // 이메일 발송 메서드
  private async sendEmail(
    to: string,
    subject: string,
    text: string
  ): Promise<void> {
    const mailOptions = {
      from: `"LottoPass" <${this.configService.get<string>('EMAIL_USER')}>`,
      to,
      subject,
      text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`[LottoPass] 인증 이메일이 ${to}로 전송되었습니다.`);
    } catch (error) {
      console.error('[LottoPass] 이메일 전송 실패:', error);
      throw new HttpException(
        '이메일 전송에 실패했습니다. 다시 시도해주세요.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 이메일 인증 코드 요청 메서드
  async requestVerificationCode(dto: RequestVerificationDto): Promise<void> {
    const { email } = dto;

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Redis에 인증 코드 저장 (TTL 5분)
    console.log(`Saving code: ${verificationCode} for email: ${email}`);
    await this.cacheManager.set(
      `verification:${email}`,
      verificationCode,
      300000
    );

    try {
      await this.sendEmail(
        email,
        '[LottoPass] 이메일 인증 코드',
        `안녕하세요, LottoPass입니다.\n\n아래 인증 코드를 입력해 주세요:\n\n[${verificationCode}]\n\n인증 코드는 5분 동안만 유효합니다. 감사합니다.`
      );
      console.log(`[LottoPass] 인증 코드가 ${email}로 전송되었습니다.`);
    } catch (error) {
      throw new HttpException(
        '인증 코드 전송에 실패했습니다. 다시 시도해주세요.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 이메일 인증 코드 검증 메서드
  async verifyCode(dto: VerifyCodeDto): Promise<void> {
    const { email, verificationCode } = dto;

    // Redis에서 저장된 인증 코드 확인
    const storedCode = await this.cacheManager.get<string>(
      `verification:${email}`
    );

    if (!storedCode || storedCode !== verificationCode) {
      throw new BadRequestException(
        '입력하신 인증 코드가 유효하지 않거나 만료되었습니다.'
      );
    }

    // 인증 성공 시 Redis에서 코드 삭제
    await this.cacheManager.del(`verification:${email}`);
    console.log(`[LottoPass] 이메일 인증 성공: ${email}`);
  }
}
