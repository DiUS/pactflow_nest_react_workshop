import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GamesResolver } from './game.resolver';

@Module({
  controllers: [GameController],
  providers: [GameService, GamesResolver],
  exports: [GameService],
})
export class GameModule {}
