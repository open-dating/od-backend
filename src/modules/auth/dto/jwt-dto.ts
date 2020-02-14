import {ApiProperty} from '@nestjs/swagger'

export class JwtDto {
  @ApiProperty()
  accessToken: string
}
