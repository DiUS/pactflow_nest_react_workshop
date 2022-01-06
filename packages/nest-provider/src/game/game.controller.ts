import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import { GameService } from './game.service';

@Controller()
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('games')
  getGames() {
    return this.gameService.getGames();
  }

  @Get('game/:id')
  async getGame(@Param('id') id: number) {
    const res = await this.gameService.getGame(id);
    if (!res || res === {}) {
      throw new HttpException('Invalid game', HttpStatus.BAD_REQUEST);
    }
    return res;
  }
}
