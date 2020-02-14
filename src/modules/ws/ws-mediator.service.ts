import {Injectable, Logger} from '@nestjs/common'
import {WsGateway} from './ws.gateway'
import {classToPlain} from 'class-transformer'
import {WsOutEvent} from './enum/ws-out-event.enum'

@Injectable()
export class WsMediatorService {
  private ws: WsGateway
  private logger: Logger = new Logger('WsMediator')

  registerWsGateway(ws: WsGateway) {
    this.ws = ws
    this.logger.log('Socket gateway added')
  }

  emitMessage(userId: any, eventName: WsOutEvent, data: object) {
    const filtered = classToPlain(data)

    this.ws.server
      .to(`${userId}`)
      .emit(eventName, filtered)

    this.logger.log(`Emit msg for ${userId}`)
  }
}
