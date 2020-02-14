import {Module} from '@nestjs/common'
import {UserModule} from '../user/user.module'
import {MailService} from './mail.service'

@Module({
  imports: [
    UserModule,
  ],
  controllers: [
  ],
  providers: [
    MailService,
  ],
  exports: [
    MailService,
  ],
})

export class MailModule {}
