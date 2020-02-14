import {ApiProperty} from '@nestjs/swagger'
import {IsNotEmpty} from 'class-validator'

export class FcmFormDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'In2399fs2jKjas',
  })
  token: string

  @ApiProperty()
  remove: boolean
}
