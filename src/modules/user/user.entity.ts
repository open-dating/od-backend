import {Column, Entity, Index, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique} from 'typeorm'
import {Photo} from '../photo/photo.enity'
import {ApiProperty} from '@nestjs/swagger'
import {Point} from '@turf/turf'
import {ImDialog} from '../im/im-dialog.entity'
import {Exclude, Expose} from 'class-transformer'
import {UserRole} from './enum/user-role.enum'
import {UserFcm} from './user-fcm.entity'
import {UserGender} from './enum/user-gender.enum'
import {UserSetting} from './user-setting.entity'
import * as moment from 'moment'
import {UserUseType} from './enum/user-use-type.enum'
import {Complaint} from '../complaint/complaint.entity'
import {UserHabits} from './user-habits.entity'

@Exclude()
@Entity()
@Unique(['email'])
export class User {
  @ApiProperty()
  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Expose()
  @Index()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.User,
  })
  role: UserRole

  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @Column({length: 255})
  email: string

  @ApiProperty()
  @Expose()
  @Column({length: 255})
  firstname: string

  @Column()
  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  bday: Date

  @ApiProperty()
  @Expose()
  @Column()
  weight: number

  @ApiProperty()
  @Expose()
  @Column()
  height: number

  @ApiProperty()
  @Expose()
  @Index()
  @Column({
    type: 'enum',
    enum: UserGender,
  })
  gender: UserGender

  @ApiProperty()
  @Expose()
  @Index()
  @Column({
    type: 'enum',
    enum: UserUseType,
  })
  useType: UserUseType

  @Column({default: false})
  acceptedUseDataInScience: boolean

  @Column({default: ''})
  bio: string

  @Column({length: 64})
  passHash: string

  @ApiProperty({
    example: {
      type: 'Point',
      coordinates: [0, 0],
    },
  })
  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @Index()
  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point

  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @OneToOne(() => Photo)
  @JoinColumn()
  selfie: Photo

  @ApiProperty({
    type: [Photo],
  })
  @Expose()
  @OneToMany(() => Photo, photo => photo.user)
  photos: Photo[]

  @Column({default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date

  @Column({default: () => 'CURRENT_TIMESTAMP'})
  lastActiveAt: Date

  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @OneToOne(() => UserSetting, u => u.user, {
    cascade: true,
  })
  @JoinColumn()
  setting: UserSetting

  @Expose()
  @JoinColumn()
  @OneToOne(() => UserHabits, u => u.user, {
    cascade: true,
  })
  habits: UserHabits

  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @ManyToMany(() => ImDialog, dialog => dialog.users)
  dialogs: ImDialog[]

  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @ManyToMany(() => ImDialog, dialog => dialog.unreadByUsers)
  unreadDialogs: ImDialog[]

  @OneToMany(() => UserFcm, photo => photo.user)
  fcmTokens: UserFcm[]

  @Expose()
  @ApiProperty()
  @Column({ nullable: true, insert: false, update: false, select: false })
  locationDistance: number

  @Expose()
  @ApiProperty()
  @Column({ nullable: true, insert: false, update: false, select: false })
  cubeDistance: number

  @Expose()
  @ApiProperty()
  get age(): number {
    if (!this.bday) {
      return 0
    }
    return moment().diff(this.bday, 'years')
  }

  @Expose({groups: [UserRole.Admin]})
  @ApiProperty()
  @OneToMany(() => Complaint, c => c.toUser)
  complaintsToUser: Complaint[]
}
