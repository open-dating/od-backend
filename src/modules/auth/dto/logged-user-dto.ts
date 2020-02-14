import {User} from '../../user/user.entity'
import {ApiProperty} from '@nestjs/swagger'
import {JwtDto} from './jwt-dto'
import {Exclude, Expose} from 'class-transformer'

@Exclude()
export class LoggedUserDto {
  @ApiProperty({
    type: User,
  })
  @Expose()
  profile: User

  @ApiProperty({
    type: JwtDto,
  })
  @Expose()
  jwt: JwtDto
}
