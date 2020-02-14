import {Column, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn, Unique} from 'typeorm'
import {User} from '../user/user.entity'
import {ApiProperty} from '@nestjs/swagger'
import {ImMessage} from './im-message.entity'
import {Expose} from 'class-transformer'

@Expose()
@Entity()
@Unique(['compositeUsersKey'])
export class ImDialog {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({
    type: User,
  })
  @ManyToMany(() => User, u => u.dialogs, {
    cascade: true,
  })
  @JoinTable()
  users: User[]

  @Column()
  compositeUsersKey: string

  @ApiProperty({
    type: User,
  })
  @ManyToMany(() => User, u => u.unreadDialogs, {
    cascade: true,
  })
  @JoinTable()
  unreadByUsers: User[]

  @Index()
  @Column('boolean', {default: false})
  @ApiProperty()
  isBlocked: boolean

  @ApiProperty()
  @Column({default: null})
  blockedAt: Date|null

  blockedBy: User

  @ApiProperty()
  @Index()
  @Column({nullable: true})
  lastMessageId: number | null

  lastMessage: ImMessage | null

  @Column({default: () => 'CURRENT_TIMESTAMP'})
  lastActivityAt: Date

  @ApiProperty()
  @Column({default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date
}
