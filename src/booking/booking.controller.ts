import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BookingService } from './services/booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('')
  @ApiOperation({ summary: 'Получение всех броней' })
  @ApiResponse({ status: 200, description: 'брони номеров' })
  async findAllBooking() {
    return this.bookingService.findAllBooking();
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Получение всех комнат' })
  @ApiResponse({ status: 200, description: 'Список комнат' })
  async findAllRooms() {
    return this.bookingService.findAllRooms();
  }

  @Get('rooms/available')
  @ApiQuery({ name: 'startDate', type: String, example: '2023-12-01' })
  @ApiQuery({ name: 'endDate', type: String, example: '2023-12-10' })
  @ApiOperation({
    summary: 'Получение всех доступных номеров на выбранные даты',
  })
  @ApiResponse({ status: 200, description: 'Доступные номера' })
  async findAvailableRooms(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.bookingService.findAvailableRooms(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Бронирование номера' })
  @ApiResponse({ status: 201, description: 'Комната создана' })
  @ApiResponse({ status: 409, description: 'Комната занята' })
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(createBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Отмена брони' })
  @ApiResponse({ status: 200, description: 'Бронирование успешно отменено' })
  async cancel(@Param('id') id: string) {
    return this.bookingService.cancelBooking(+id);
  }
}
