import {IsEmail} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class AutoChangePassFormDto {
  @IsEmail()
  @ApiProperty({
    example: 'foo@bar.com',
  })
  email: string
}
