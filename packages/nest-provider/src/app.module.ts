import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    GameModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      path: 'graphql',
    }),
  ],
})
export class AppModule {}
