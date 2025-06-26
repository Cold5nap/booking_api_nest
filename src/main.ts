import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { RoomGeneratorService } from './booking/services/booking-generate-rooms.service';

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Booking API')
    .setDescription('API для бронирования номеров в отеле')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

async function fillDB(app: INestApplication) {
  const roomGeneratorService = app.get(RoomGeneratorService);
  await roomGeneratorService.setupRooms();
}
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);

	await app.listen(process.env.PORT ?? 3000);
	  await fillDB(app);
}
bootstrap();
