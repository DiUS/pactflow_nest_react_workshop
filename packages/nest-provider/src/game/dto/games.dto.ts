import { ObjectType, Field } from '@nestjs/graphql';
import { Game } from '../models/game.model';

@ObjectType()
export class GamesResponse {
  @Field(() => [Game])
  public data: Game[];
}
