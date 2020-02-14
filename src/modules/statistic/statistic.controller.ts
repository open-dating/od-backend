import {Controller, Get, HttpStatus, Request, UseGuards, UseInterceptors} from '@nestjs/common'
import {AuthGuard} from '@nestjs/passport'
import {ApiBearerAuth, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger'
import {RestDataProtectInterceptor} from '../shared/interceptors/rest-data-protect.interceptor'
import {HttpException} from '@nestjs/common/exceptions/http.exception'
import {UserStatisticDto} from './dto/user-statistic-dto'
import {UserStatisticService} from './user-statistic.service'
import {UserService} from '../user/user.service'
import {UserRole} from '../user/enum/user-role.enum'

@ApiTags('statistic')
@ApiBearerAuth()
@Controller()
export class StatisticController {
  constructor(
    private readonly userService: UserService,
    private readonly userStatisticService: UserStatisticService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/api/v1/statistic/user/:relatedToUserId')
  @ApiParam({name: 'relatedToUserId', type: 'number'})
  @ApiResponse({type: UserStatisticDto})
  @UseInterceptors(RestDataProtectInterceptor())
  async userStatistic(@Request() req): Promise<UserStatisticDto> {
    const relatedToUserId = +req.params.relatedToUserId
    const userId = +req.user.id
    const isAdmin = req.user.role === UserRole.Admin

    const user = await this.userService.findById(userId)
    if (relatedToUserId !== user.id && !isAdmin) {
      throw new HttpException(`Wrong role. UserId: ${userId} try to access statistic: ${relatedToUserId}`, HttpStatus.FORBIDDEN)
    }

    return this.userStatisticService.calcStatisticForUser(relatedToUserId)
  }
}
