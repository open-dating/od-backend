import {Module} from '@nestjs/common'
import {SentryModule} from '@ntegral/nestjs-sentry'
import {TypeOrmModule} from '@nestjs/typeorm'
import {APP_INTERCEPTOR} from '@nestjs/core'

import * as ormCommonConfig from './config/orm.common'
import {appConfig} from './config/app.config'

import {UserModule} from './modules/user/user.module'
import {AuthModule} from './modules/auth/auth.module'
import {WsModule} from './modules/ws/ws.module'
import {PhotoModule} from './modules/photo/photo.module'
import {ChoiceModule} from './modules/choice/choice.module'
import {ImModule} from './modules/im/im.module'
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
import {MailModule} from './modules/mail/mail.module'
import {StatisticModule} from './modules/statistic/statistic.module'
import {UserHabits} from './modules/user/user-habits.entity'
import {SystemModule} from './modules/system/system.module'
import {FCMModule} from './modules/fcm/fcm.module'
import {ErrorInterceptor} from './modules/shared/interceptors/error.interceptor'

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
    SentryModule.forRoot({
      dsn: appConfig.sentry.dsn,
      debug: false,
      environment: process.env.NODE_ENV || 'unknown',
      release: appConfig.sentry.release,
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
  ],
})
export class AppModule {
}
