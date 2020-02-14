import {ApiProperty} from '@nestjs/swagger'

export class StatisticItemDto {
  @ApiProperty()
  ymd: Date

  @ApiProperty()
  value: number
}
