import { Injectable } from '@nestjs/common';
import { PactProviderOptionsFactory, PactProviderOptions } from 'nestjs-pact';
import { GameService } from '../game.service';

const path = require('path');

@Injectable()
export class PactProviderConfigOptionsService
  implements PactProviderOptionsFactory
{
  public constructor(private readonly gameService: GameService) {}

  public createPactProviderOptions(): PactProviderOptions {
    return {
      logLevel: 'debug',
      enablePending: true,
      provider: 'YOUR_PROVIDER',
      providerVersion: '1.0.0',
      pactUrls: [
        path.resolve(__dirname, '../../../../react-consumer/pacts/your_consumer-your_provider.json')
      ],
      stateHandlers: {
        'game with id 3 does not exist': async () => {
          this.gameService.clear();
          return 'invalid game id';
        },
        'games exist': async () => {
          this.gameService.importData();
          return 'all games are returned - REST';
        },
        'query for games': async () => {
          this.gameService.importData();
          return 'all games are returned - GraphQL';
        },
      },
    };
  }
}
