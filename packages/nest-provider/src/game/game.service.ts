import { Injectable } from '@nestjs/common';
import { Game } from './models/game.model';
const fs = require('fs');
const path = require('path');

@Injectable()
export class GameService {
  private games: Game[];

  public constructor() {
    this.games = [];
    this.importData();
  }

  public getGames (): Game[] {
    return this.games;
  }

  public insert(game): Game {
    const newGame = {
      id: this.games.length + 1,
      ...game,
    };

    this.games.push(newGame);

    return newGame;
  }

  public importData(): void {
    const data = (fs.readFileSync(
      path.resolve("./src/data/mock.json"),
      "utf-8"
    ) as unknown) as string

    JSON.parse(data).reduce((game, value) => {
      value.id = game + 1
      this.insert(value)
      return game + 1
    }, 0)
  }

  public clear() {
    this.games = [];
  }

  async getGame (id: number): Promise<Game | {}> {
    const game = gamesData.data.find(game => game.id == id);
    return game;
  }
}
