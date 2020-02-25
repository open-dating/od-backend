import {ApiProperty} from '@nestjs/swagger'
import {IsEnum} from 'class-validator'
import {UserHabitPeriodicity} from '../enum/user-habit-periodicity.enum'

export class EditFormHabitsDto {
  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @IsEnum(UserHabitPeriodicity)
  concert: UserHabitPeriodicity

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @IsEnum(UserHabitPeriodicity)
  cinema: UserHabitPeriodicity

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @IsEnum(UserHabitPeriodicity)
  museumAndTheatre: UserHabitPeriodicity

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @IsEnum(UserHabitPeriodicity)
  hike: UserHabitPeriodicity

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @IsEnum(UserHabitPeriodicity)
  trip: UserHabitPeriodicity

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @IsEnum(UserHabitPeriodicity)
  book: UserHabitPeriodicity

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @IsEnum(UserHabitPeriodicity)
  active: UserHabitPeriodicity
}
