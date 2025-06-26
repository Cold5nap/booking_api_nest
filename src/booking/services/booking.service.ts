import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { Room } from '../entities/room.entity';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly httpService: HttpService,
  ) {}

  async findAllBooking(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  async findAllRooms(): Promise<Room[]> {
    return this.roomRepository.find();
  }

  async findAvailableRooms(startDate: Date, endDate: Date): Promise<Room[]> {
    const overlappingBookings = await this.bookingRepository.find({
      where: {
        startDate: LessThanOrEqual(endDate),
        endDate: MoreThanOrEqual(startDate),
      },
      relations: ['room'],
    });

    const bookedRoomIds = overlappingBookings.map((booking) => booking.room.id);

    const query = this.roomRepository.createQueryBuilder('room');

    if (bookedRoomIds.length > 0) {
      query.where('room.id NOT IN (:...bookedRoomIds)', { bookedRoomIds });
    }

    return query.getMany();
  }

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { roomId, startDate, endDate, guestEmail } = createBookingDto;
    if (endDate < startDate) {
      throw new ConflictException(
        'Дата занятия номера не может быть позже выселения ',
      );
    }
    const isAvailable = await this.isRoomAvailable(roomId, startDate, endDate);
    if (!isAvailable) {
      throw new ConflictException(`Номер занят с ${startDate} по ${endDate}`);
    }

    // проверка вип статуса
    const isVip = await this.checkVipStatus(guestEmail);

    const room = await this.roomRepository.findOneBy({ id: roomId });
    if (!room) {
      throw new ConflictException('Такого номера не существует');
    }

    const booking = this.bookingRepository.create({
      ...createBookingDto,
      isVip,
      room,
    });

    return this.bookingRepository.save(booking);
  }

  async cancelBooking(id: number): Promise<void> {
    await this.bookingRepository.delete(id);
  }

  private async isRoomAvailable(
    roomId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const overlappingBooking = await this.bookingRepository.findOne({
      where: {
        room: { id: roomId },
        startDate: LessThanOrEqual(endDate),
        endDate: MoreThanOrEqual(startDate),
      },
    });

    return !overlappingBooking;
  }

  private async checkVipStatus(email: string): Promise<boolean> {
    try {
      const response = await firstValueFrom<{ data: { isVip: true } }>(
        this.httpService.get(`https://your_api_check?email=${email}`),
      );
      return response.data.isVip;
	} catch (error) {
		return false
      throw new Error('Ошибка при обращении к api для проверки vip статуса');
    }
  }
}
