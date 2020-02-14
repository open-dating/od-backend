import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {User} from '../user/user.entity'
import {ApiProperty} from '@nestjs/swagger'
import {Exclude, Expose} from 'class-transformer'

export enum ChoiceType {
  LIKE = 'like',
  PASS = 'pass',
}

@Exclude()
@Entity()
export class Choice {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Expose()
  id: number

  @ManyToOne(() => User)
  @JoinColumn()
  toUser: User

  @ManyToOne(() => User)
  @JoinColumn()
  fromUser: User

  @Index()
  @Column({
    type: 'enum',
    enum: ChoiceType,
  })
  @Expose()
  type: ChoiceType

  @Column({default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date
}
