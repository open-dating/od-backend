import {ApiProperty} from '@nestjs/swagger'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum, IsIn,
  IsNotEmpty,
  IsNumber, IsString, MaxLength,
  Min,
  MinLength, ValidateNested,
} from 'class-validator'
import {Point} from '@turf/turf'
import {UserGender} from '../../user/enum/user-gender.enum'
import {UserUseType} from '../../user/enum/user-use-type.enum'
import {RegFormHabitsDto} from './reg-form-habits-dto'

export class RegFormDto {
  @IsEmail()
  @MinLength(6)
  @ApiProperty({
    example: 'foo@bar.com',
  })
  email: string

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    example: 'foobar',
  })
  pass: string

  @IsNotEmpty()
  @MinLength(1)
  @ApiProperty({
    example: 'jonh',
  })
  firstname: string

  @IsNotEmpty()
  @IsEnum(UserUseType)
  @ApiProperty({
    description: Object.values(UserUseType).join('|'),
    example: UserUseType.Rel,
  })
  useType: UserUseType

  @IsNotEmpty()
  @ApiProperty({
    example: {
      type: 'Point',
      coordinates: [37.6174943, 55.7504461],
    },
  })
  location: Point

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
  })
  selfieId: number

  @ApiProperty({
    example: [1, 2],
  })
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  photosIds: number[]

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    type: 'string',
    example: '1995-08-01T00:00:00+03:00',
  })
  bday: Date

  @IsNotEmpty()
  @IsEnum(UserGender)
  @ApiProperty({
    description: Object.values(UserGender).join('|'),
    example: UserGender.Male,
  })
  gender: UserGender

  @ApiProperty({
    example: 50,
  })
  @Min(20)
  @IsNumber()
  @IsNotEmpty()
  weight: number

  @ApiProperty({
    example: 150,
  })
  @Min(30)
  @IsNumber()
  @IsNotEmpty()
  height: number

  @ApiProperty({
    example: '',
  })
  @IsString()
  @MaxLength(1500)
  bio: string

  @ApiProperty()
  @ValidateNested()
  habits: RegFormHabitsDto

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  acceptedUseDataInScience: boolean

  @IsBoolean()
  @IsIn([true])
  @IsNotEmpty()
  @ApiProperty({
    example: true,
  })
  tolerantPromise: boolean

  @IsBoolean()
  @IsIn([true])
  @IsNotEmpty()
  @ApiProperty({
    example: true,
  })
  honestyAndGoodnessPromise: boolean

  @IsBoolean()
  @IsIn([true])
  @IsNotEmpty()
  @ApiProperty({
    example: true,
  })
  tos: boolean
}
