import {IsNotEmpty, IsNumber, IsString} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class ComplaintFormDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 50,
  })
  toUserId: number

  @IsString()
  @ApiProperty({
    example: '',
  })
  text: string

  @IsNumber()
  @ApiProperty()
  dialogId: number

  @IsString()
  @ApiProperty({
    example: '',
  })
  location: string
}
