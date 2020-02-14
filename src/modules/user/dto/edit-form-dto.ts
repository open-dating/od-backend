import {ApiProperty} from '@nestjs/swagger'
import {IsNotEmpty, Min, ArrayMinSize, ArrayMaxSize, IsNumber} from 'class-validator'

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
}
