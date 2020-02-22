import {Module} from '@nestjs/common'
import {UserModule} from './modules/user/user.module'
import {AuthModule} from './modules/auth/auth.module'
import {WsModule} from './modules/ws/ws.module'
import {PhotoModule} from './modules/photo/photo.module'
import {ChoiceModule} from './modules/choice/choice.module'
import {ImModule} from './modules/im/im.module'
import {TypeOrmModule} from '@nestjs/typeorm'
import {User} from './modules/user/user.entity'
import {UserFcm} from './modules/user/user-fcm.entity'
import {UserSetting} from './modules/user/user-setting.entity'
import {Photo} from './modules/photo/photo.enity'
import {Choice} from './modules/choice/choice.entity'
import {ImDialog} from './modules/im/im-dialog.entity'
import {ImMessage} from './modules/im/im-message.entity'
import {AdminModule} from './modules/admin/admin.module'
import {ComplaintModule} from './modules/complaint/complaint.module'
import {Complaint} from './modules/complaint/complaint.entity'
import * as ormCommonConfig from './config/orm.common'
import {MailModule} from './modules/mail/mail.module'
import {StatisticModule} from './modules/statistic/statistic.module'
import {UserHabits} from './modules/user/user-habits.entity'
import {SystemModule} from './modules/system/system.module'
import {FCMModule} from './modules/fcm/fcm.module'

@Module({
  imports: [
    WsModule,
    UserModule,
    AuthModule,
    PhotoModule,
    ChoiceModule,
    ImModule,
    AdminModule,
    ComplaintModule,
    MailModule,
    StatisticModule,
    SystemModule,
    FCMModule,
    TypeOrmModule.forRoot({
      ...ormCommonConfig,
      entities: [
        User,
        Photo,
        Choice,
        ImDialog,
        ImMessage,
        UserFcm,
        UserSetting,
        UserHabits,
        Complaint,
      ],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
