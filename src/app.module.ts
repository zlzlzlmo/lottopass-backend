import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LottoModule } from './lotto/lotto.module';

@Module({
  imports: [LottoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
