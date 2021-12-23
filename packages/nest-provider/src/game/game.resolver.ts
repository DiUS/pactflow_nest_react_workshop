import { Query, Resolver } from '@nestjs/graphql';
import { GameService } from './game.service';
import { Game } from './models/game.model';
import { GamesResponse } from './dto/games.dto';

@Resolver(() => Game)
export class GamesResolver {
  constructor(private readonly service: GameService) {}

  @Query(() => GamesResponse)
  async games(): Promise<GamesResponse> {
    const games = await this.service.getGames();
    return { data: games };
  }
}
