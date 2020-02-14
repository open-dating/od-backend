import {Controller, Post, Body, UnauthorizedException, UseInterceptors} from '@nestjs/common'
import { AuthService } from './auth.service'
import {ApiBody, ApiResponse, ApiTags} from '@nestjs/swagger'
import {LoginFormDto} from './dto/login-form-dto'
import {LoggedUserDto} from './dto/logged-user-dto'
import {RegFormDto} from './dto/reg-form-dto'
import {RestDataProtectInterceptor} from '../shared/interceptors/rest-data-protect.interceptor'
import {UserRole} from '../user/enum/user-role.enum'
import {UserEditService} from '../user/user-edit.service'
import {AuthRestoreService} from './auth-restore.service'
import {AutoChangePassFormDto} from './dto/auto-change-pass-form-dto'

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userEditService: UserEditService,
    private readonly authRestoreService: AuthRestoreService,
  ) {}

  /**
   * we dont use local.strategy, for validate first before execute query in db
   */
  @Post('/api/v1/auth/login')
  @ApiBody({
    type: LoginFormDto,
  })
  @ApiResponse({
    type: LoggedUserDto,
  })
  @UseInterceptors(RestDataProtectInterceptor({addRoles: [UserRole.Owner]}))
  async login(@Body() form: LoginFormDto): Promise<LoggedUserDto> {
    const user = await this.authService.validateUser(form.email, form.pass)
    if (user) {
      return this.authService.login(user)
    }
    throw new UnauthorizedException()
  }

  @Post('/api/v1/auth/create-user')
  @ApiBody({
    type: RegFormDto,
  })
  @ApiResponse({
    type: LoggedUserDto,
  })
  @UseInterceptors(RestDataProtectInterceptor({addRoles: [UserRole.Owner]}))
  async createUser(@Body() form: RegFormDto): Promise<LoggedUserDto> {
    const user = await this.userEditService.createUser(form)

    return this.authService.login(user)
  }

  @Post('/api/v1/auth/auto-change-pass')
  @ApiBody({
    type: AutoChangePassFormDto,
  })
  async autoChangePass(@Body() form: AutoChangePassFormDto): Promise<void> {
    await this.authRestoreService.autoChangePass(form.email)
  }
}
