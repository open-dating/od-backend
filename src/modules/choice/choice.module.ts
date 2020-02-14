import {Module} from '@nestjs/common'
import {ChoiceService} from './choice.service'
import {ChoiceController} from './choice.controller'
import {TypeOrmModule} from '@nestjs/typeorm'
import {Choice} from './choice.entity'
import {ImModule} from '../im/im.module'
import {UserModule} from '../user/user.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Choice]),
    ImModule,
    UserModule,
  ],
  controllers: [ChoiceController],
  providers: [ChoiceService],
  exports: [ChoiceService],
})
export class ChoiceModule {}
