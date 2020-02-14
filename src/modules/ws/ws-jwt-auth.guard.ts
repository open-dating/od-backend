import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import {JwtService} from '@nestjs/jwt'
import {Socket} from 'socket.io'
import {JwtUserPayload} from '../auth/interfaces/jwt-user-payload.interface'

export interface AuthorizedSocket extends Socket {
  user: JwtUserPayload
}

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient()

    await this.jwtService.verifyAsync(client.handshake.query.token)

    const user = this.jwtService.decode(client.handshake.query.token)

    client.user = user

    return Boolean(user)
  }
}
