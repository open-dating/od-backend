import {ApiProperty} from '@nestjs/swagger'
import {IsNotEmpty, Min, IsNumber, Max, IsEnum} from 'class-validator'
import {UserGender} from '../enum/user-gender.enum'

export class SettingsFormDto {
  @IsNotEmpty()
  @IsEnum(UserGender)
  @ApiProperty({
    description: Object.values(UserGender).join('|'),
    example: UserGender.Male,
  })
  searchGender: UserGender

  @IsNotEmpty()
  @IsNumber()
  @Min(100)
  @ApiProperty({
    example: 100000,
  })
  searchRadius: number

  @IsNotEmpty()
  @IsNumber()
  @Min(18)
  @ApiProperty({
    example: 18,
  })
  minAge: number

  @IsNotEmpty()
  @IsNumber()
  @Max(70)
  @ApiProperty({
    example: 70,
  })
  maxAge: number
}
