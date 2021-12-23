import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export const bootstrap = async (port: number = 4000) => {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(port);
  return app;
}
bootstrap();

