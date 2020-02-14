import {Module} from '@nestjs/common'
import {UserModule} from '../user/user.module'
import {FCMService} from './fcm.service'

@Module({
  imports: [
    UserModule,
  ],
  controllers: [
  ],
  providers: [
    FCMService,
  ],
  exports: [
    FCMService,
  ],
})

export class FCMModule {}
