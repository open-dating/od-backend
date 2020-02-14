import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
import {ApiProperty} from '@nestjs/swagger'
import {Exclude, Expose} from 'class-transformer'
import {UserRole} from './enum/user-role.enum'
import {User} from './user.entity'
import {UserGender} from './enum/user-gender.enum'

@Exclude()
@Entity()
export class UserSetting {
  @ApiProperty()
  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @Column()
  searchRadius: number

  @ApiProperty()
  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @Column()
  minAge: number

  @ApiProperty()
  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @Column()
  maxAge: number

  @ApiProperty()
  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @Column()
  searchGender: UserGender

  @OneToOne(() => User, u => u.setting)
  user: User
}
