import {appConfig} from '../../config/app.config'
import * as admin from 'firebase-admin'
import {Logger} from '@nestjs/common'
import {ImDialog} from '../im/im-dialog.entity'
import {ImMessage} from '../im/im-message.entity'
import {FCMType} from './enum/fcm-type.enum'
import * as fs from 'fs'

let fcmAdminApp: admin.app.App

export class FCMService {
  private logger: Logger = new Logger('FCMService')

  constructor() {
    if (!fcmAdminApp) {
      if (!fs.existsSync(appConfig.fcmFilePath)) {
        this.logger.log(`FCM config file not found ${appConfig.fcmFilePath}, you can go to https://console.firebase.google.com/ and create project`)

        if (fs.existsSync(`${appConfig.fcmFilePath}.example`)) {
          this.logger.log(`Try to create ${appConfig.fcmFilePath} from ${appConfig.fcmFilePath}.example`)
          fs.copyFileSync(`${appConfig.fcmFilePath}.example`, `${appConfig.fcmFilePath}`)
        }
      }

      fcmAdminApp = admin.initializeApp({
        credential: admin.credential.cert(appConfig.fcmFilePath),
      })
    }
  }

  private sendFcmMessage(tokens = [], data = {}): Promise<admin.messaging.BatchResponse> {
    return fcmAdminApp.messaging().sendMulticast({
      tokens,
      data,
    }).catch(e => {
      this.logger.error(`Send fcm error ${e.toString()}`)
      return Promise.reject(e)
    })
  }

  async sendCreateDialogNotify(dialog: ImDialog): Promise<void> {
    const tokens = dialog.users
      .map(u => u.fcmTokens.map(t => t.token))
      .flat()

    if (!tokens.length) {
      return
    }

    const payload = {
      title: `New math`,
      dialogId: String(dialog.id),
      type: FCMType.match,
    }

    await this.sendFcmMessage(tokens, payload)
  }

  async sendMessageNotify(message: ImMessage): Promise<void> {
    const tokens = []
    for (const dialogUser of message.dialog.users) {
      if (dialogUser.id !== message.fromUser.id) {
        tokens.push(...dialogUser.fcmTokens.map(t => t.token))
      }
    }

    if (!tokens.length) {
      return
    }

    const payload = {
      title: `New message`,
      dialogId: String(message.dialog.id),
      type: FCMType.message,
    }

    await this.sendFcmMessage(tokens, payload)
  }
}
