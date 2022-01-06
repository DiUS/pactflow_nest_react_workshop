import { Injectable } from '@nestjs/common';
import { Game } from './models/game.model';
import * as gamesData from '../data/mock.json';

@Injectable()
export class GameService {
  async getGames (): Promise<Game[]> {
    return gamesData.data;
  }

  async getGame (id: number): Promise<Game | {}> {
    const game = gamesData.data.find(game => game.id == id);
    return game;
  }
}
