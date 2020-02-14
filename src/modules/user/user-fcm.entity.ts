import {ApiProperty} from '@nestjs/swagger'
import {Exclude, Expose} from 'class-transformer'
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {User} from './user.entity'

@Exclude()
@Entity()
export class UserFcm {
  @ApiProperty()
  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, user => user.fcmTokens)
  user: User

  @ApiProperty()
  @Column({length: 255})
  token: string
}
