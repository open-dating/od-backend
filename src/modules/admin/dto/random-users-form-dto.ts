import {IsEnum, IsNotEmpty, Min} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'
import {Point} from '@turf/turf'
import {UserUseType} from '../../user/enum/user-use-type.enum'
import {UserGender} from '../../user/enum/user-gender.enum'

export class RandomUsersFormDto {
  @IsNotEmpty()
  @ApiProperty({
    example: {
      type: 'Point',
      coordinates: [37.6174943, 55.7504461],
    },
  })
  location: Point

  @Min(1)
  @IsNotEmpty()
  @ApiProperty({
    example: 3,
  })
  count: number

  @IsNotEmpty()
  @ApiProperty({
    example: 'foobar',
  })
  pass: string

  @IsNotEmpty()
  @IsEnum(UserUseType)
  @ApiProperty({
    description: Object.values(UserUseType).join('|'),
    example: UserUseType.Rel,
  })
  useType: UserUseType

  @IsNotEmpty()
  @IsEnum(UserGender)
  @ApiProperty({
    description: Object.values(UserGender).join('|'),
    example: UserGender.Male,
  })
  gender: UserGender

  @ApiProperty({
    required: false,
    example: false,
  })
  createDialogs: boolean
}
