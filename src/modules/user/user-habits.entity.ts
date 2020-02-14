import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
import {ApiProperty} from '@nestjs/swagger'
import {Exclude, Expose} from 'class-transformer'
import {User} from './user.entity'
import {UserHabitPeriodicity} from './enum/user-habit-periodicity.enum'

@Exclude()
@Entity()
export class UserHabits {
  @ApiProperty()
  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @Expose()
  @Column({
    type: 'enum',
    enum: UserHabitPeriodicity,
    default: UserHabitPeriodicity.Never,
  })
  concert: UserHabitPeriodicity

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @Expose()
  @Column({
    type: 'enum',
    enum: UserHabitPeriodicity,
    default: UserHabitPeriodicity.Never,
  })
  cinema: UserHabitPeriodicity

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @Expose()
  @Column({
    type: 'enum',
    enum: UserHabitPeriodicity,
    default: UserHabitPeriodicity.Never,
  })
  museumAndTheatre: UserHabitPeriodicity

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @Expose()
  @Column({
    type: 'enum',
    enum: UserHabitPeriodicity,
    default: UserHabitPeriodicity.Never,
  })
  hike: UserHabitPeriodicity

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @Expose()
  @Column({
    type: 'enum',
    enum: UserHabitPeriodicity,
    default: UserHabitPeriodicity.Never,
  })
  trip: UserHabitPeriodicity

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @Expose()
  @Column({
    type: 'enum',
    enum: UserHabitPeriodicity,
    default: UserHabitPeriodicity.Never,
  })
  book: UserHabitPeriodicity

  @ApiProperty({
    description: Object.values(UserHabitPeriodicity).join('|'),
    example: UserHabitPeriodicity.Never,
  })
  @Expose()
  @Column({
    type: 'enum',
    enum: UserHabitPeriodicity,
    default: UserHabitPeriodicity.Never,
  })
  extreme: UserHabitPeriodicity

  @OneToOne(() => User, u => u.habits)
  user: User
}
