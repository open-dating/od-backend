import {ApiBearerAuth, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger'
import {Controller, Post, Request, UseGuards, UseInterceptors} from '@nestjs/common'
import {ChoiceService} from './choice.service'
import {AuthGuard} from '@nestjs/passport'
import {Choice} from './choice.entity'
import {LikeDto} from './dto/like-dto'
import {RestDataProtectInterceptor} from '../shared/interceptors/rest-data-protect.interceptor'

@ApiTags('choice')
@ApiBearerAuth()
@Controller()
@UseInterceptors(RestDataProtectInterceptor())
export class ChoiceController {
  constructor(private readonly likeOrPassService: ChoiceService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/api/v1/choice/like/:toUserId')
  @ApiParam({
    name: 'toUserId',
    type: 'number',
  })
  @ApiResponse({type: LikeDto})
  async like(@Request() req): Promise<LikeDto> {
    return this.likeOrPassService.like(+req.user.id, +req.params.toUserId)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/api/v1/choice/pass/:toUserId')
  @ApiParam({
    name: 'toUserId',
    type: 'number',
  })
  @ApiResponse({type: Choice})
  async pass(@Request() req): Promise<Choice> {
    return this.likeOrPassService.pass(+req.user.id, +req.params.toUserId)
  }
}
