import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, DataSource } from 'typeorm';
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
    private readonly dataSource: DataSource,
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

    // Валидация дат
    if (endDate < startDate) {
      throw new ConflictException('Дата заселения не может быть позже даты выселения');
    }

    // Атомарность при бронировании
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Проверяем доступность номера в рамках транзакции
      const room = await queryRunner.manager.findOne(Room, {
        where: { id: roomId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!room) {
        throw new ConflictException('Такого номера не существует');
      }

      const overlappingBooking = await queryRunner.manager.findOne(Booking, {
        where: {
          room: { id: roomId },
          startDate: LessThanOrEqual(endDate),
          endDate: MoreThanOrEqual(startDate),
        },
      });

      if (overlappingBooking) {
        throw new ConflictException(`Номер занят с ${startDate} по ${endDate}`);
      }

      // Проверка VIP статуса
      const isVip = await this.checkVipStatus(guestEmail);

      // Создаем бронирование
      const booking = this.bookingRepository.create({
        ...createBookingDto,
        isVip,
        room,
      });
	  // Добавлена атомарность
      const savedBooking = await queryRunner.manager.save(booking);
      await queryRunner.commitTransaction();
      return savedBooking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelBooking(id: number): Promise<void> {
    await this.bookingRepository.delete(id);
  }

  private async checkVipStatus(email: string): Promise<boolean> {
    try {
      const response = await firstValueFrom<{ data: { isVip: true } }>(
        this.httpService.get(`https://your_api_check?email=${email}`),
      );
      return response.data.isVip;
    } catch (error) {
		return false;
		throw new Error('Ошибка при обращении к api для проверки vip статуса');
    }
  }
}