import { Module } from '@nestjs/common';
import { PactProviderModule } from 'nestjs-pact';
import { PactProviderConfigOptionsService } from './pact.service';
import { GameService } from '../game.service';
import { GameModule } from '../game.module';

@Module({
  imports: [
    PactProviderModule.registerAsync({
      imports: [GameModule],
      useClass: PactProviderConfigOptionsService,
      inject: [GameService],
    }),
  ],
})
export class PactModule {}
