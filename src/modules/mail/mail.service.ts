import * as nodemailer from 'nodemailer'
import {Transporter} from 'nodemailer'
import {appConfig} from '../../config/app.config'
import * as SMTPTransport from 'nodemailer/lib/smtp-transport'
import {SentMessageInfo} from 'nodemailer'
import {ImMessage} from '../im/im-message.entity'

export class MailService {
  private transporter: Transporter

  constructor() {
    const connectConfig: SMTPTransport.Options = {
      host: appConfig.smtp.host,
      port: appConfig.smtp.port,
      secure: appConfig.smtp.secure,
      auth: {
        user: appConfig.smtp.auth.user,
        pass: appConfig.smtp.auth.pass,
      },
    }

    this.transporter = nodemailer.createTransport(connectConfig)
  }

  sendEmail(to: string, subject: string, html: string): Promise<SentMessageInfo> {
    return this.transporter.sendMail({
      from: appConfig.smtp.robotEmail,
      to,
      subject,
      html,
    })
  }

  async sendDonationEmailFromCreateImMessage(message: ImMessage) {
    for (const dialogUser of message.dialog.users) {
      await this.transporter.sendMail({
        from: appConfig.smtp.robotEmail,
        to: dialogUser.email,
        subject: `Congratulations`,
        html: `Looks like you exchanged phone numbers`,
      })
    }
  }
}
