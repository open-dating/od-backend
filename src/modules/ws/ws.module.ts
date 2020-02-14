import {Module} from '@nestjs/common'
import {WsGateway} from './ws.gateway'
import {WsMediatorService} from './ws-mediator.service'
import {JwtModule} from '@nestjs/jwt'
import {appConfig} from '../../config/app.config'
import {UserModule} from '../user/user.module'

@Module({
  providers: [WsGateway, WsMediatorService],
  exports: [WsMediatorService],
  imports: [
    JwtModule.register({
      secret: appConfig.jwtSecret,
      signOptions: appConfig.jwtSignOptions,
    }),
    UserModule,
  ],
})
export class WsModule {}
