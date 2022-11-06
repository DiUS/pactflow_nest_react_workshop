import { Test } from '@nestjs/testing';
import { PactVerifierService } from 'nestjs-pact';
import { INestApplication, Logger, LoggerService } from '@nestjs/common';
import { GameModule } from './game.module';
import { GameService } from './game.service';
import { PactModule } from './pact/pact.module';
import { GraphQLModule } from '@nestjs/graphql';

jest.setTimeout(30000);

describe('Pact Verification', () => {
  let verifier: PactVerifierService;
  let logger: LoggerService;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GameModule,
        PactModule,
        GraphQLModule.forRoot({
          autoSchemaFile: true,
          playground: true,
          path: '/graphql',
        }),
      ],
      providers: [GameService, Logger],
    }).compile();

    verifier = moduleRef.get(PactVerifierService);
    logger = moduleRef.get(Logger);

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it("Validates the expectations of 'Matching Service'", async () => {
    const output = await verifier.verify(app);

    logger.log('Pact Verification Complete!');
    logger.log(output);
  });

  afterAll(async () => {
    await app.close();
  });
});
