import {NestInterceptor, Type} from '@nestjs/common/interfaces'
import {ExecutionContext} from '@nestjs/common/interfaces/features/execution-context.interface'
import {Observable} from 'rxjs'
import {CallHandler} from '@nestjs/common/interfaces/features/nest-interceptor.interface'
import {mixin, PlainLiteralObject} from '@nestjs/common'
import {classToPlain, ClassTransformOptions} from 'class-transformer'
import {map} from 'rxjs/operators'
import {IncomingMessage} from 'http'
import {JwtUserPayload} from '../../auth/interfaces/jwt-user-payload.interface'
import {UserRole} from '../../user/enum/user-role.enum'

export function RestDataProtectInterceptor(options = {addRoles: []}): Type<NestInterceptor> {
  class DataProtectInterceptor implements NestInterceptor {
    protected addRoles: UserRole[]

    constructor() {
      this.addRoles = options.addRoles
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next
        .handle()
        .pipe(
          map((data: PlainLiteralObject | PlainLiteralObject[]) => {
            const msg: IncomingMessage = context.getArgs()[0]
            const user: JwtUserPayload | undefined = (msg.connection as any).parser.incoming.user
            return this.serializeData(data, user)
          }),
        )
    }

    private serializeData(data: any, user: JwtUserPayload | undefined) {
      // tslint:disable-next-line:no-shadowed-variable
      const options: ClassTransformOptions = {
        groups: [...this.addRoles],
      }

      if (user) {
        options.groups.push(user.role)
      }

      return classToPlain(data, options)
    }
  }

  const Interceptor = mixin(DataProtectInterceptor)
  return Interceptor as Type<NestInterceptor>
}
