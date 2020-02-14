import {Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne} from 'typeorm'
import {User} from '../user/user.entity'
import {ApiProperty} from '@nestjs/swagger'
import {appConfig} from '../../config/app.config'
import {Exclude, Expose} from 'class-transformer'
import {UserRole} from '../user/enum/user-role.enum'
import {FaceLandmarks} from './interfaces/face-landmarks.interface'

@Exclude()
@Entity()
export class Photo {
  @ApiProperty()
  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Column({length: 255})
  filePath: string

  @ApiProperty()
  @Expose()
  @Column()
  width: number

  @ApiProperty()
  @Expose()
  @Column()
  height: number

  @Expose()
  @Column({default: 0})
  faceCount: number

  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @Column('float8')
  openNSFWScore: number

  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @Index()
  @Column('float8', {array: true, default: '{}'})
  faceEncoding: number[]

  @Expose({groups: [UserRole.Owner, UserRole.Admin]})
  @Column('float8', {array: true, default: '{}'})
  allFacesEncoding: number[][]

  @Expose()
  @Column('jsonb', {default: '[]'})
  allFacesLandmarks: FaceLandmarks[]

  @ManyToOne(() => User, user => user.photos)
  user: User

  @Expose()
  @ApiProperty()
  get url(): string {
    return `${appConfig.host}${this.filePath.substr(appConfig.rootPath.length)}`
  }

  @Expose()
  @ApiProperty()
  get isNSFW(): boolean {
    if (!this.openNSFWScore || this.openNSFWScore > appConfig.NSFWTreshold) {
      return true
    }
    return false
  }
}
