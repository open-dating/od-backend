import {Module} from '@nestjs/common'
import {UserModule} from '../user/user.module'
import {SystemController} from './system.controller'
import {ImModule} from '../im/im.module'

@Module({
  imports: [
    UserModule,
    ImModule,
  ],
  controllers: [SystemController],
  providers: [],
  exports: [],
})
export class SystemModule {
}
