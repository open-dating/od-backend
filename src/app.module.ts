// tslint:disable-next-line:no-var-requires
require('dotenv').config()

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
import {AdminModule} from './modules/admin/admin.module'
import {ComplaintModule} from './modules/complaint/complaint.module'
import {MailModule} from './modules/mail/mail.module'
import {StatisticModule} from './modules/statistic/statistic.module'
import {SystemModule} from './modules/system/system.module'
import {FCMModule} from './modules/fcm/fcm.module'
import {ErrorInterceptor} from './modules/shared/interceptors/error.interceptor'
import {entities} from './modules/shared/entities'

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
      entities,
      // Sync only in dev mode. On test or prod use migrations
      synchronize: appConfig.isDev,
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
