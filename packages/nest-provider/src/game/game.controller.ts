import {
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
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
    const response = await this.gameService.getGame(id);
    if (!response) {
      throw new NotFoundException('Invalid game')
    }
    return response;
  }
}
