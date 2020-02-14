import {Injectable} from '@nestjs/common'
import {UserStatisticDto} from './dto/user-statistic-dto'
import {ChoiceService} from '../choice/choice.service'
import {ChoiceType} from '../choice/choice.entity'
import {ImService} from '../im/im.service'

@Injectable()
export class UserStatisticService {
  constructor(
    private readonly choiceService: ChoiceService,
    private readonly imService: ImService,
  ) {}

  async calcStatisticForUser(id: number): Promise<UserStatisticDto> {
    const stat = new UserStatisticDto();

    ([
      stat.likes,
      stat.passes,
    ] = await Promise.all([
      this.choiceService.findCountFromUserId(id, ChoiceType.LIKE),
      this.choiceService.findCountFromUserId(id, ChoiceType.PASS),
    ]));

    ([
      stat.likesFromOtherUsers,
      stat.passesFromOtherUsers,
    ] = await Promise.all([
      this.choiceService.findCountToUserId(id, ChoiceType.LIKE),
      this.choiceService.findCountToUserId(id, ChoiceType.PASS),
    ]))

    stat.matches = await this.imService.findCountWithUserId(id)

    return stat
  }
}
