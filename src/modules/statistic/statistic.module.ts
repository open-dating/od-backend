import {Module} from '@nestjs/common'
import {StatisticController} from './statistic.controller'
import {UserStatisticService} from './user-statistic.service'
import {UserModule} from '../user/user.module'
import {ChoiceModule} from '../choice/choice.module'
import {ImModule} from '../im/im.module'
import {PublicStatisticController} from './public-statistic.controller'
import {PublicStatisticService} from './public-statistic.service'

@Module({
  imports: [
    UserModule,
    ImModule,
    ChoiceModule,
  ],
  controllers: [
    StatisticController,
    PublicStatisticController,
  ],
  providers: [
    UserStatisticService,
    PublicStatisticService,
  ],
  exports: [],
})
export class StatisticModule {}
