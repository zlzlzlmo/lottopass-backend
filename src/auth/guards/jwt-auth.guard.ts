import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard: 요청 처리 중...');
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.error('JwtAuthGuard 에러:', err || info);
      throw err || new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
    console.log('JwtAuthGuard: 인증 성공');
    return user;
  }
}
