import {IsNotEmpty} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class MessageFormDto {
  @IsNotEmpty()
  @ApiProperty()
  dialogId: number

  @ApiProperty()
  text: string

  @ApiProperty()
  photoId: number
}
