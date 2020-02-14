import {ApiProperty} from '@nestjs/swagger'
import {IsEmail, IsNotEmpty} from 'class-validator'

export class LoginFormDto {
  @IsEmail()
  @ApiProperty({
    example: 'foo@bar.com',
  })
  email: string

  @IsNotEmpty()
  @ApiProperty({
    example: 'foobar',
  })
  pass: string
}
