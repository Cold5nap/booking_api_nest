import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../entities/room.entity';
import { Booking } from '../entities/booking.entity';

@Injectable()
export class RoomGeneratorService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateRandomRoomName(): string {
    const roomTypes = [
      'Стандарт',
      'Делюкс',
      'Люкс',
      'Представительский',
      'Семейный',
      'Президентский',
    ];
    const roomViews = ['Сад', 'Город', 'Море', 'Горы', 'Бассейн'];
    const roomNumbers = Array.from({ length: 1000 }, (_, i) => i + 100);

    const type = roomTypes[Math.floor(Math.random() * roomTypes.length)];
    const view = roomViews[Math.floor(Math.random() * roomViews.length)];
    const number = roomNumbers[Math.floor(Math.random() * roomNumbers.length)];

    return `${type} ${view} ${number}`;
  }

  private generateRandomDescription(roomName: string): string {
    const descriptions = [
      `Красивый ${roomName} с удобствами`,
      `Просторный ${roomName} с современным дизайном`,
      `Роскошный ${roomName} с премиальными функциями`,
      `Уютный ${roomName} идеально подходит для отдыха`,
      `Элегантный ${roomName} с потрясающим видом`,
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  async generateRooms(count: number = 100): Promise<Room[]> {
    const rooms: Room[] = [];

    for (let i = 0; i < count; i++) {
      const roomName = this.generateRandomRoomName();
      const room = new Room();
      room.name = roomName;
      room.description = this.generateRandomDescription(roomName);
      room.pricePerNight = this.getRandomInt(50, 500);
      room.capacity = this.getRandomInt(1, 4);

      rooms.push(room);
    }

    return this.roomRepository.save(rooms);
  }

  async clearAllRooms(): Promise<void> {
    // await this.bookingRepository.clear();
    await this.roomRepository.deleteAll();
  }

  async setupRooms(): Promise<void> {
    console.log('Начало генерации комнат...');
    await this.clearAllRooms();
    const rooms = await this.generateRooms(100);
    console.log(`Успешно сгенерировано ${rooms.length} комнат!`);
  }
}
