import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from './booking.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  pricePerNight: number;

  @Column()
  capacity: number;

  @OneToMany(() => Booking, (booking) => booking.room, {
    cascade: true, // автоматическое сохранение связанных бронирований
    onDelete: 'CASCADE', // автоматическое удаление при удалении комнаты
  })
  bookings: Booking[];
}
