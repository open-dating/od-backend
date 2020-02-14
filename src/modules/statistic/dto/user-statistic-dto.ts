import {ApiProperty} from '@nestjs/swagger'
import {StatisticItemDto} from '../../shared/dto/statistic-item-dto'

export class UserStatisticDto {
  @ApiProperty()
  likes: StatisticItemDto[]

  @ApiProperty()
  passes: StatisticItemDto[]

  @ApiProperty()
  matches: StatisticItemDto[]

  @ApiProperty()
  likesFromOtherUsers: StatisticItemDto[]

  @ApiProperty()
  passesFromOtherUsers: StatisticItemDto[]
}
