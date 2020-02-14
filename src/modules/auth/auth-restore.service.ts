import {UserService} from '../user/user.service'
import * as faker from 'faker'
import {UserEditService} from '../user/user-edit.service'
import {MailService} from '../mail/mail.service'
import {User} from '../user/user.entity'
import {HttpException} from '@nestjs/common/exceptions/http.exception'
import {HttpStatus, Injectable} from '@nestjs/common'

@Injectable()
export class AuthRestoreService {
  constructor(
    private readonly userService: UserService,
    private readonly userEditService: UserEditService,
    private readonly mailService: MailService,
  ) {}

  async autoChangePass(email: string): Promise<{
    user: User,
    pass: string,
  }> {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      throw new HttpException('User not found or removed or blocked', HttpStatus.NOT_FOUND)
    }

    const pass = faker.random.alphaNumeric(6)
    await this.userEditService.changePass(user, pass)

    await this.mailService.sendEmail(
      user.email,
      `Pass was changed`,
      `Use your new password: ${pass}`,
    )

    return {user, pass}
  }
}
