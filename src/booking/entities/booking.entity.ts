import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Room } from './room.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guestName: string;

  @Column()
  guestEmail: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: false })
  isVip: boolean;

  @ManyToOne(() => Room, room => room.bookings)
  room: Room;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}