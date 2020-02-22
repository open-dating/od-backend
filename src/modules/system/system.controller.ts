import {Controller, Delete, HttpStatus, Request, UseGuards, UseInterceptors} from '@nestjs/common'
import {AuthGuard} from '@nestjs/passport'
import {ApiBearerAuth, ApiParam, ApiTags} from '@nestjs/swagger'
import {RestDataProtectInterceptor} from '../shared/interceptors/rest-data-protect.interceptor'
import {HttpException} from '@nestjs/common/exceptions/http.exception'
import {UserEditService} from '../user/user-edit.service'
import {UserRole} from '../user/enum/user-role.enum'
import {ImService} from '../im/im.service'

@ApiTags('system')
@ApiBearerAuth()
@Controller()
export class SystemController {
  constructor(
    private readonly userEditService: UserEditService,
    private readonly imService: ImService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Delete('/api/v1/system/user/:relatedToUserId')
  @ApiParam({name: 'relatedToUserId', type: 'number'})
  @UseInterceptors(RestDataProtectInterceptor({addRoles: [UserRole.Owner]}))
  async removeProfile(@Request() req): Promise<void> {
    const relatedToUserId = +req.params.relatedToUserId
    const userId = +req.user.id
    const isAdmin = req.user.role === UserRole.Admin

    if (userId !== relatedToUserId && !isAdmin) {
      throw new HttpException(`Wrong role. UserId: ${userId} try access to remove user: ${relatedToUserId}`, HttpStatus.FORBIDDEN)
    }

    await this.imService.removeDialogs(relatedToUserId)

    await this.userEditService.removeProfile(relatedToUserId)

    // TODO: remove photos
  }
}
