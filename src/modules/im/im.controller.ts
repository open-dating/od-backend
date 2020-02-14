import {ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger'
import {Body, Controller, Get, HttpStatus, Post, Request, UseGuards, UseInterceptors, Patch} from '@nestjs/common'
import {MessageFormDto} from './dto/message-form-dto'
import {AuthGuard} from '@nestjs/passport'
import {ImService} from './im.service'
import {ImMessage} from './im-message.entity'
import {UserRole} from '../user/enum/user-role.enum'
import {HttpException} from '@nestjs/common/exceptions/http.exception'
import {ItemsListDto} from '../shared/dto/items-list-dto'
import {ImDialog} from './im-dialog.entity'
import {RestDataProtectInterceptor} from '../shared/interceptors/rest-data-protect.interceptor'

@ApiTags('im')
@ApiBearerAuth()
@Controller()
@UseInterceptors(RestDataProtectInterceptor())
export class ImController {
  constructor(private readonly imService: ImService) {}

  @ApiBody({
    type: MessageFormDto,
  })
  @ApiResponse({
    type: ImMessage,
  })
  @Post('/api/v1/im/send-message')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({type: ImMessage})
  async sendMessage(@Request() req, @Body() form: MessageFormDto): Promise<ImMessage> {
    return this.imService.createMessage(+req.user.id, form)
  }

  @Get('/api/v1/im/dialogs/:relatedToUserId')
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({name: 'relatedToUserId', type: 'number'})
  @ApiQuery({name: 'limit', type: 'number', required: false})
  @ApiQuery({name: 'skip', type: 'number', required: false})
  @ApiResponse({type: ItemsListDto})
  async userDialogs(@Request() req): Promise<ItemsListDto<ImDialog>> {
    const relatedToUserId = +req.params.relatedToUserId
    const userId = +req.user.id
    const isAdmin = req.user.role === UserRole.Admin

    if (userId !== relatedToUserId && !isAdmin) {
      throw new HttpException(`Wrong role. UserId: ${userId} try access to relatedToUserId: ${relatedToUserId}`, HttpStatus.FORBIDDEN)
    }

    const skip = Number(req.query.skip || 0)
    const limit = Number(req.query.limit || 25)

    const data = await this.imService.findUserDialogs(relatedToUserId, {
      skip,
      limit,
      excludeBlocked: isAdmin ? false : true,
    })

    await new Promise(resolve => setTimeout(resolve, 1000))

    const nextSkip = data.length >= limit ? Number(skip + data.length) : skip

    return new ItemsListDto<ImDialog>(data, {skip, limit, nextSkip})
  }

  @Get('/api/v1/im/dialog/:dialogId/messages')
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({name: 'dialogId', type: 'number'})
  @ApiQuery({name: 'olderThanId', type: 'number', required: false})
  @ApiQuery({name: 'limit', type: 'number', required: false})
  @ApiResponse({type: ItemsListDto})
  async userMessages(@Request() req): Promise<ItemsListDto<ImMessage>> {
    const dialogId = +req.params.dialogId
    const userId = +req.user.id
    const isAdmin = req.user.role === UserRole.Admin

    const dialog = await this.imService.findDialog(dialogId, {
      excludeBlocked: isAdmin ? false : true,
    })
    if (!dialog) {
      throw new HttpException('Not found or blocked', HttpStatus.NOT_FOUND)
    }

    const ownerIds = dialog.users.map(u => u.id)
    if (ownerIds.indexOf(userId) === -1 && !isAdmin) {
      throw new HttpException(`Wrong role. UserId: ${userId} try to access dialogId: ${dialogId}`, HttpStatus.FORBIDDEN)
    }

    const olderThanId = Number(req.query.olderThanId || 0)
    const limit = Number(req.query.limit || 25)

    const data = await this.imService.findDialogMessages(dialogId, {olderThanId, limit})

    const minId = data.reduce((min, msg) => {
      return msg.id < min ? msg.id : min
    }, Infinity)

    await new Promise(resolve => setTimeout(resolve, 1000))

    return new ItemsListDto<ImMessage>(data, {limit, minId, dialog})
  }

  @Patch('/api/v1/im/dialog/:dialogId/mark-as-read')
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({name: 'dialogId', type: 'number'})
  async markDialogAsRead(@Request() req): Promise<ImDialog> {
    return this.imService.markDialogAsRead(+req.params.dialogId, +req.user.id)
  }

  @Patch('/api/v1/im/dialog/:dialogId/block')
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({name: 'dialogId', type: 'number'})
  async blockDialogAsRead(@Request() req): Promise<ImDialog> {
    const dialogId = +req.params.dialogId
    const userId = +req.user.id
    const isAdmin = req.user.role === UserRole.Admin

    const dialog = await this.imService.findDialog(dialogId)

    const ownerIds = dialog.users.map(u => u.id)
    if (ownerIds.indexOf(userId) === -1 && !isAdmin) {
      throw new HttpException(`Wrong role. UserId: ${userId} try to block dialogId: ${dialogId}`, HttpStatus.FORBIDDEN)
    }

    return this.imService.blockDialog(dialog, userId)
  }
}
