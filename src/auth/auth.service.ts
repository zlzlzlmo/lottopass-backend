import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntitiy } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { GoogleUser } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntitiy)
    private readonly userRepository: Repository<UserEntitiy>
  ) {}
  async handleGoogleLogin(googleUserData: GoogleUser) {
    const { email, name, picture } = googleUserData;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      const newUser = this.userRepository.create({
        email,
        name,
        picture,
        provider: 'Google',
      });

      return await this.userRepository.save(newUser);
    }

    return user;
  }
}
