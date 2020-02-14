import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {ImDialog} from './im-dialog.entity'
import {ImMessage} from './im-message.entity'
import {ImService} from './im.service'
import {WsModule} from '../ws/ws.module'
import {ImController} from './im.controller'
import {UserModule} from '../user/user.module'
import {PhotoModule} from '../photo/photo.module'
import {FCMModule} from '../fcm/fcm.module'
import {MailModule} from '../mail/mail.module'

@Module({
  imports: [
    WsModule,
    UserModule,
    PhotoModule,
    FCMModule,
    MailModule,
    TypeOrmModule.forFeature([ImMessage, ImDialog]),
  ],
  controllers: [ImController],
  providers: [ImService],
  exports: [ImService],
})
export class ImModule {}
