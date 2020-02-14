import {Module} from '@nestjs/common'
import {AuthService} from './auth.service'
import {AuthRestoreService} from './auth-restore.service'
import {UserModule} from '../user/user.module'
import {PassportModule} from '@nestjs/passport'
import {AuthController} from './auth.controller'
import {JwtModule} from '@nestjs/jwt'
import {JwtStrategy} from './jwt.strategy'
import {appConfig} from '../../config/app.config'
import {MailModule} from '../mail/mail.module'

@Module({
  controllers: [AuthController],
  imports: [
    UserModule,
    PassportModule,
    MailModule,
    JwtModule.register({
      secret: appConfig.jwtSecret,
      signOptions: appConfig.jwtSignOptions,
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    AuthRestoreService,
  ],
})
export class AuthModule {}
