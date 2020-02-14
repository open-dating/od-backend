import {OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets'
import {Logger} from '@nestjs/common'
import {Server, Socket} from 'socket.io'
import {WsMediatorService} from './ws-mediator.service'
import {JwtService} from '@nestjs/jwt'
import {UserEditService} from '../user/user-edit.service'
import {WsOutEvent} from './enum/ws-out-event.enum'
import {WsInEvent} from './enum/ws-in-event.enum'

const ioClientIdUserIdMap = new Map<string, number>()

@WebSocketGateway({path: '/api/v1/ws'})
export class WsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server

  private logger: Logger = new Logger('WsGateway')

  constructor(
    private readonly wsMediator: WsMediatorService,
    private readonly jwtService: JwtService,
    private readonly userEditService: UserEditService,
  ) {
    this.wsMediator.registerWsGateway(this)
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.jwtService.verifyAsync(client.handshake.query.token).then(() => {
      const payload: any = this.jwtService.decode(client.handshake.query.token)

      client.join(`${payload.id}`)

      ioClientIdUserIdMap.set(client.id, payload.id)

      this.logger.log(`Client connected: ${payload.id}/${client.id}`)

      return this.userEditService.updateUserLastActive(payload.id)
    }).catch(e => {
      this.logger.log(`Wrong socket credential: ${e.toString()}`)
      client.emit(WsOutEvent.AuthError, e.toString())
    })
  }

  // @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(WsInEvent.UserActive)
  async onUserActive(client: Socket) {
    const userId = ioClientIdUserIdMap.get(client.id)

    await this.userEditService.updateUserLastActive(userId)
  }
}
