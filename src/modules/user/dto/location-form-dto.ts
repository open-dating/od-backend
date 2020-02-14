import {ApiProperty} from '@nestjs/swagger'
import {IsNotEmpty} from 'class-validator'
import {Point} from '@turf/turf'

export class LocationFormDto {
  @IsNotEmpty()
  @ApiProperty({
    example: {
      type: 'Point',
      coordinates: [37.6174943, 55.7504461],
    },
  })
  location: Point
}
