import {ApiProperty} from '@nestjs/swagger'
import {IsNotEmpty, Min, ArrayMinSize, ArrayMaxSize, IsNumber, IsString, MaxLength, ValidateNested} from 'class-validator'
import {EditFormHabitsDto} from './edit-form-habits-dto'

export class EditFormDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(20)
  @ApiProperty({
    example: 50,
  })
  weight: number

  @ApiProperty({
    example: [1, 2],
  })
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  photosIds: number[]

  @ApiProperty({
    example: '',
  })
  @IsString()
  @MaxLength(1500)
  bio: string

  @ApiProperty()
  @ValidateNested()
  habits: EditFormHabitsDto
}
