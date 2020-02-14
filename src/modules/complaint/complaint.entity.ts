import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {ApiProperty} from '@nestjs/swagger'
import {Exclude, Expose} from 'class-transformer'
import {User} from '../user/user.entity'
import {ComplaintStatus} from './enum/complaint-status.enum'

@Exclude()
@Entity()
export class Complaint {
  @ApiProperty()
  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Expose()
  @Column()
  text: string

  @Column({default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date

  @Expose()
  @ManyToOne(() => User)
  fromUser: User

  @Expose()
  @ManyToOne(() => User)
  toUser: User

  @Expose()
  @Column({nullable: true})
  dialogId: number

  @Expose()
  @Column({default: ''})
  location: string

  @Expose()
  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.New,
  })
  status: ComplaintStatus
}
