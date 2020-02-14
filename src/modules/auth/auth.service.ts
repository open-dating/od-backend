import {Injectable} from '@nestjs/common'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import {User} from '../user/user.entity'
import {LoggedUserDto} from './dto/logged-user-dto'
import {JwtUserPayload} from './interfaces/jwt-user-payload.interface'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    return this.userService.findCredential(email, pass)
  }

  login(user: User): LoggedUserDto {
    const payload: JwtUserPayload = {
      email: user.email,
      id: user.id,
      role: user.role,
    }

    return {
      profile: user,
      jwt: {
        accessToken: this.getTokenByPayload(payload),
      },
    }
  }

  getTokenByPayload(payload: JwtUserPayload) {
    return this.jwtService.sign(payload)
  }
}
