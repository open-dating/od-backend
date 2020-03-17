import {ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common'
import {catchError} from 'rxjs/operators'
import {withScope, captureException, Handlers} from '@sentry/node'
import {CallHandler} from '@nestjs/common/interfaces/features/nest-interceptor.interface'
import {IncomingMessage} from 'http'
import {JwtUserPayload} from '../../auth/interfaces/jwt-user-payload.interface'
import {appConfig} from '../../../config/app.config'

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next
      .handle()
      .pipe(catchError(error => {
        withScope(scope => {
          scope.addEventProcessor(event => Handlers.parseRequest(event, context.switchToHttp().getRequest()))

          const msg: IncomingMessage = context.getArgs()[0]
          const user: JwtUserPayload | undefined = (msg.connection as any).parser.incoming.user
          if (user) {
            scope.setUser({
              id: String(user.id),
              email: String(user.email),
            })
          }

          if (appConfig.isProd) {
            captureException(error)
          }
        })
        throw error
      }))
  }
}
