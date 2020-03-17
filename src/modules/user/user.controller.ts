import {Controller, Get, HttpStatus, Request, UseGuards, UseInterceptors} from '@nestjs/common'
import {UserService} from './user.service'
import {AuthGuard} from '@nestjs/passport'
import {ApiBearerAuth, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger'
import {User} from './user.entity'
import {ItemsListDto} from '../shared/dto/items-list-dto'
import {RestDataProtectInterceptor} from '../shared/interceptors/rest-data-protect.interceptor'
import {UserRole} from './enum/user-role.enum'
import {HttpException} from '@nestjs/common/exceptions/http.exception'

@ApiTags('user')
@ApiBearerAuth()
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/api/v1/user/my-profile')
  @ApiResponse({
    type: User,
  })
  @UseInterceptors(RestDataProtectInterceptor({addRoles: [UserRole.Owner]}))
  getMyProfile(@Request() req): Promise<User> {
    return this.userService.findById(req.user.id)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/api/v1/user/profile/:userId')
  @ApiResponse({
    type: User,
  })
  @UseInterceptors(RestDataProtectInterceptor())
  @ApiParam({name: 'userId', type: 'number'})
  async getProfile(@Request() req): Promise<User> {
    const isAdmin = req.user.role === UserRole.Admin

    const [user, me] = await Promise.all([
      this.userService.findById(+req.params.userId),
      this.userService.findById(+req.user.id),
    ])

    if (user.isRemoved && !isAdmin) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    this.userService.calcRelationsBetweenUsers(me, user)

    return user
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/api/v1/user/search-near')
  @ApiResponse({type: ItemsListDto})
  @UseInterceptors(RestDataProtectInterceptor())
  async searchNear(@Request() req): Promise<ItemsListDto<User>> {
    const data = await this.userService.findNearUsers(req.user.id)
    return new ItemsListDto<User>(data, {forUser: req.user})
  }
}
