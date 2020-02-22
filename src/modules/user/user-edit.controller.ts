import {Body, Controller, Delete, HttpStatus, Patch, Request, UseGuards, UseInterceptors} from '@nestjs/common'
import {UserService} from './user.service'
import {AuthGuard} from '@nestjs/passport'
import {ApiBearerAuth, ApiBody, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger'
import {User} from './user.entity'
import {RestDataProtectInterceptor} from '../shared/interceptors/rest-data-protect.interceptor'
import {UserRole} from './enum/user-role.enum'
import {UserEditService} from './user-edit.service'
import {LocationFormDto} from './dto/location-form-dto'
import {FcmFormDto} from './dto/fcm-form-dto'
import {EditFormDto} from './dto/edit-form-dto'
import {SettingsFormDto} from './dto/settings-form-dto'
import {HttpException} from '@nestjs/common/exceptions/http.exception'
import {LangFormDto} from './dto/lang-form-dto'

@ApiTags('user')
@ApiBearerAuth()
@Controller()
export class UserEditController {
  constructor(
    private readonly userService: UserService,
    private readonly userEditService: UserEditService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Patch('/api/v1/user/my-profile')
  @ApiResponse({
    type: User,
  })
  @ApiBody({type: EditFormDto})
  @UseInterceptors(RestDataProtectInterceptor({addRoles: [UserRole.Owner]}))
  editMyProfile(@Body() form: EditFormDto, @Request() req): Promise<User> {
    return this.userEditService.updateProfileFields(req.user.id, form)
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/api/v1/user/location')
  @ApiBody({type: LocationFormDto})
  @UseInterceptors(RestDataProtectInterceptor({addRoles: [UserRole.Owner]}))
  async saveGeoLocation(@Body() form: LocationFormDto, @Request() req): Promise<void> {
    await this.userEditService.updateUserGeoLocation(req.user.id, form.location)
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/api/v1/user/fcm')
  @ApiBody({type: FcmFormDto})
  @UseInterceptors(RestDataProtectInterceptor({addRoles: [UserRole.Owner]}))
  async saveOrRemoveFCM(@Body() form: FcmFormDto, @Request() req): Promise<void> {
    await this.userEditService.saveOrRemoveFcmToken(
      req.user.id,
      form.token,
      Boolean(form.remove),
    )
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/api/v1/user/settings')
  @ApiBody({type: SettingsFormDto})
  @UseInterceptors(RestDataProtectInterceptor({addRoles: [UserRole.Owner]}))
  async saveSettings(@Body() form: SettingsFormDto, @Request() req): Promise<User> {
    return this.userEditService.updateProfileSettings(req.user.id, form)
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/api/v1/user/lang')
  @ApiBody({type: LangFormDto})
  @UseInterceptors(RestDataProtectInterceptor({addRoles: [UserRole.Owner]}))
  async saveLang(@Body() form: LangFormDto, @Request() req): Promise<void> {
    await this.userEditService.updateUserLang(req.user.id, form.language)
  }
}
