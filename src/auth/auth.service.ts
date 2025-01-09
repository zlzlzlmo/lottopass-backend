import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';

export interface SocialUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  provider: string; // 'Google', 'Kakao', 'Naver' 등
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async handleSocialLogin(socialUserData: SocialUser): Promise<UserEntity> {
    const { id, email, name, picture, provider } = socialUserData;

    console.log('email :', socialUserData);

    // const user = await this.userRepository.findOne({
    //   where: { providerId: id },
    // });

    // if (!user) {
    //   user = this.userRepository.create({
    //     providerId: id,
    //     email,
    //     name,
    //     picture,
    //     provider,
    //   });

    //   return await this.userRepository.save(user);
    // }

    // user.providerId = id;
    // user.name = name;
    // user.picture = picture;
    // user.provider = provider;
    return;
  }
}
