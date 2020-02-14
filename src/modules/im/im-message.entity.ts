import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
import {User} from '../user/user.entity'
import {ImDialog} from './im-dialog.entity'
import {ApiProperty} from '@nestjs/swagger'
import {Expose} from 'class-transformer'
import {Photo} from '../photo/photo.enity'

@Expose()
@Entity()
export class ImMessage {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Column('text')
  text: string

  @ApiProperty({
    type: User,
  })
  @ManyToOne(() => User)
  @JoinColumn()
  fromUser: User

  @ApiProperty({
    type: ImDialog,
  })
  @ManyToOne(() => ImDialog)
  @JoinColumn()
  dialog: ImDialog

  @ApiProperty({
    type: Photo,
  })
  @OneToOne(() => Photo)
  @JoinColumn()
  photo: Photo

  @Column({default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date
}
