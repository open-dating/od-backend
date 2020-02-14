import * as crypto from 'crypto'
import {appConfig} from '../config/app.config'

export function getHashOfPass(pass: string) {
  return crypto.createHmac('sha256', `${String(pass).trim()}:${appConfig.passHashSalt}`).digest('hex')
}
