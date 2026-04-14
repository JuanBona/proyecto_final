import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { createRequestValidationPipe } from './common/request-validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(createRequestValidationPipe());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
