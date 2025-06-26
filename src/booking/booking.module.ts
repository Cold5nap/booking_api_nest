import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './services/booking.service';
import { Booking } from './entities/booking.entity';
import { Room } from './entities/room.entity';
import { HttpModule } from '@nestjs/axios';
import { RoomGeneratorService } from './services/booking-generate-rooms.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Room]), HttpModule],
  controllers: [BookingController],
  providers: [BookingService, RoomGeneratorService],
})
export class BookingModule {}
