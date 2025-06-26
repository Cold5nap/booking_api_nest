import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'John Doe', description: 'ФИО гостя' })
  @IsNotEmpty()
  guestName: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email гостя' })
  @IsEmail()
  guestEmail: string;

  @ApiProperty({ example: '2023-12-01', description: 'Дата заселения' })
  @IsDate()
  startDate: Date;

  @ApiProperty({ example: '2023-12-10', description: 'Дата выписки' })
  @IsDate()
  endDate: Date;

  @ApiProperty({ example: 1, description: 'Room ID' })
  @IsNumber()
  roomId: number;
}
