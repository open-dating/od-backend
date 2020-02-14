import {ExtractJwt, Strategy} from 'passport-jwt'
import {PassportStrategy} from '@nestjs/passport'
import {Injectable} from '@nestjs/common'
import {appConfig} from '../../config/app.config'
import {JwtUserPayload} from './interfaces/jwt-user-payload.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwtSecret,
    })
  }

  async validate(payload: JwtUserPayload): Promise<JwtUserPayload> {
    return {id: payload.id, email: payload.email, role: payload.role}
  }
}
