import {Injectable} from '@nestjs/common'
import {Repository} from 'typeorm'
import {InjectRepository} from '@nestjs/typeorm'
import {Choice, ChoiceType} from './choice.entity'
import {ImService} from '../im/im.service'
import {UserService} from '../user/user.service'
import {CreatedDialog} from '../im/interfaces/created-dialog.interface'
import {mapRawItemsToDto} from '../../utils/transformers'
import {StatisticItemDto} from '../shared/dto/statistic-item-dto'

@Injectable()
export class ChoiceService {

  constructor(
    @InjectRepository(Choice)
    private readonly choiceRepository: Repository<Choice>,
    private readonly imService: ImService,
    private readonly userService: UserService,
  ) {}

  async like(activeId: number, passiveId: number): Promise<CreatedDialog> {
    const [active, passive] = await this.userService.getUsers([activeId, passiveId])

    let dialogResult: CreatedDialog = {
      dialog: null,
      exist: false,
    }
    const ent = new Choice()
    ent.fromUser = active
    ent.toUser = passive
    ent.type = ChoiceType.LIKE

    await this.choiceRepository.save(ent)

    // check for match
    const passiveLike = await this.choiceRepository.findOne({
      fromUser: passive,
      toUser: active,
    })

    if (passiveLike) {
      dialogResult = await this.imService.createDialog(active, passive)
    }

    return {dialog: dialogResult.dialog, exist: dialogResult.exist}
  }

  async pass(activeId: number, passiveId: number) {
    const [active, passive] = await this.userService.getUsers([activeId, passiveId])

    const ent = new Choice()
    ent.fromUser = active
    ent.toUser = passive
    ent.type = ChoiceType.PASS

    return this.choiceRepository.save(ent)
  }

  private getFindStatsBaseQuery() {
    return this.choiceRepository
      .createQueryBuilder('choice')
      .select('date("choice"."createdAt") as ymd, count("choice"."createdAt") as value')
      .groupBy('ymd')
      .addOrderBy('ymd', 'ASC')
  }

  async findCountFromUserId(userId: number, type: ChoiceType): Promise<StatisticItemDto[]> {
    const query = this.getFindStatsBaseQuery()

    query
      .andWhere('"choice"."fromUserId" = :userId')
      .andWhere('"choice"."type" = :type')

    query.setParameters({userId, type})

    const values = await query.getRawMany()

    return mapRawItemsToDto<StatisticItemDto>(values, () => new StatisticItemDto())
  }

  async findCountToUserId(userId: number, type: ChoiceType): Promise<StatisticItemDto[]> {
    const query = this.getFindStatsBaseQuery()

    query
      .andWhere('"choice"."toUserId" = :userId')
      .andWhere('"choice"."type" = :type')

    query.setParameters({userId, type})

    const values = await query.getRawMany()

    return mapRawItemsToDto<StatisticItemDto>(values, () => new StatisticItemDto())
  }
}
