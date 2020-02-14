import {Body, Controller, Get, HttpStatus, Post, Request, UseGuards, UseInterceptors} from '@nestjs/common'
import {AuthGuard} from '@nestjs/passport'
import {ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger'
import {RandomUsersFormDto} from './dto/random-users-form-dto'
import {AdminGenerateService} from './admin-generate.service'
import {SeededUsersDto} from './dto/seeded-users-dto'
import {UserRole} from '../user/enum/user-role.enum'
import {HttpException} from '@nestjs/common/exceptions/http.exception'
import {UserService} from '../user/user.service'
import {ItemsListDto} from '../shared/dto/items-list-dto'
import {User} from '../user/user.entity'
import {ComplaintService} from '../complaint/complaint.service'
import {Complaint} from '../complaint/complaint.entity'
import {RestDataProtectInterceptor} from '../shared/interceptors/rest-data-protect.interceptor'

@ApiTags('admin')
@ApiBearerAuth()
@Controller()
export class AdminController {
  constructor(
    private readonly adminService: AdminGenerateService,
    private readonly userService: UserService,
    private readonly complaintService: ComplaintService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/api/v1/admin/seed')
  @ApiBody({
    type: RandomUsersFormDto,
  })
  @ApiResponse({
    type: SeededUsersDto,
  })
  async seedUsers(@Request() req, @Body() form: RandomUsersFormDto): Promise<SeededUsersDto> {
    if (req.user.role !== UserRole.Admin) {
      throw new HttpException('Wrong role', HttpStatus.FORBIDDEN)
    }

    return this.adminService.seedUsers(form)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/api/v1/admin/users')
  @ApiResponse({
    type: ItemsListDto,
  })
  @ApiQuery({name: 'page', type: 'number', required: false})
  @ApiQuery({name: 'limit', type: 'number', required: false})
  @UseInterceptors(RestDataProtectInterceptor({addRoles: [UserRole.Admin]}))
  async users(@Request() req): Promise<ItemsListDto<User>> {
    if (req.user.role !== UserRole.Admin) {
      throw new HttpException('Wrong role', HttpStatus.FORBIDDEN)
    }

    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 50)

    return this.userService.getUsersList(page, limit)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/api/v1/admin/complaints')
  @ApiResponse({
    type: ItemsListDto,
  })
  @ApiQuery({name: 'page', type: 'number', required: false})
  @ApiQuery({name: 'limit', type: 'number', required: false})
  @UseInterceptors(RestDataProtectInterceptor({addRoles: [UserRole.Admin]}))
  async complaints(@Request() req): Promise<ItemsListDto<Complaint>> {
    if (req.user.role !== UserRole.Admin) {
      throw new HttpException('Wrong role', HttpStatus.FORBIDDEN)
    }

    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 50)

    return this.complaintService.getComplaintsList(page, limit)
  }
}
