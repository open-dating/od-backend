import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {In, Repository} from 'typeorm'
import {ImDialog} from './im-dialog.entity'
import {WsMediatorService} from '../ws/ws-mediator.service'
import {User} from '../user/user.entity'
import {MessageFormDto} from './dto/message-form-dto'
import {ImMessage} from './im-message.entity'
import {UserService} from '../user/user.service'
import {WsOutEvent} from '../ws/enum/ws-out-event.enum'
import {PhotoService} from '../photo/photo.service'
import * as stripHtml from 'string-strip-html'
import {CreatedDialog} from './interfaces/created-dialog.interface'
import {mapRawItemsToDto} from '../../utils/transformers'
import {StatisticItemDto} from '../shared/dto/statistic-item-dto'
import {FCMService} from '../fcm/fcm.service'
import {hasPhoneNumber} from '../../utils/detectors'
import {MailService} from '../mail/mail.service'
import {DialogReasonBlock} from './enum/dialog-reason-block.enum'

@Injectable()
export class ImService {
  constructor(
    @InjectRepository(ImDialog)
    private readonly dialogRepository: Repository<ImDialog>,
    @InjectRepository(ImMessage)
    private readonly messageRepository: Repository<ImMessage>,
    private readonly userService: UserService,
    private readonly wsMediator: WsMediatorService,
    private readonly photoService: PhotoService,
    private readonly fcmService: FCMService,
    private readonly mailService: MailService,
  ) {}

  async createDialog(active: User, passive: User): Promise<CreatedDialog> {
    const ent = new ImDialog()
    ent.isBlocked = false
    ent.users = [active, passive]
    ent.lastActivityAt = new Date()

    // create uniq key for prevent possible race condition
    ent.compositeUsersKey = ent.users
      .sort((a, b) => a.id - b.id)
      .map(u => u.id)
      .join(':')

    const exist = await this.dialogRepository.findOne({
      relations: ['users'],
      where: {compositeUsersKey: ent.compositeUsersKey},
    })
    if (exist) {
      return {exist: true, dialog: exist}
    }

    const dialog = await this.dialogRepository.save(ent)

    for (const user of [passive, active]) {
      this.wsMediator.emitMessage(user.id, WsOutEvent.ImDialog, dialog)
      this.wsMediator.emitMessage(user.id, WsOutEvent.ImUnreadDialog, dialog)
    }

    this.fcmService.sendCreateDialogNotify(dialog)

    return {exist: false, dialog}
  }

  async createMessage(fromUserId: number, form: MessageFormDto): Promise<ImMessage> {
    const fromUser = await this.userService.findById(fromUserId)
    const dialog = await this.findDialog(+form.dialogId)

    const ent = this.messageRepository.create(form)
    ent.text = stripHtml(String(form.text || ''))
    ent.dialog = dialog
    ent.fromUser = fromUser

    if (form.photoId) {
      const photo = await this.photoService.findById(+form.photoId)
      if (photo) {
        ent.photo = photo
      }
    }

    await this.messageRepository.save(ent)

    // save last dialog for fast sort and attach last message in dialog list
    ent.dialog.lastMessageId = ent.id
    ent.dialog.lastMessage = this.messageRepository.create(ent)

    // mark as unread
    ent.dialog.unreadByUsers = []
    for (const dialogUser of dialog.users) {
      if (dialogUser.id !== fromUserId) {
        ent.dialog.unreadByUsers.push(dialogUser)
      }
    }

    ent.dialog.lastActivityAt = new Date()

    await this.dialogRepository.save(ent.dialog)

    for (const dialogUser of dialog.users) {
      this.wsMediator.emitMessage(dialogUser.id, WsOutEvent.ImNewMessage, ent)
      this.wsMediator.emitMessage(dialogUser.id, WsOutEvent.ImDialog, ent.dialog)

      // send info about unread dialog
      if (dialogUser.id !== fromUserId) {
        this.wsMediator.emitMessage(dialogUser.id, WsOutEvent.ImUnreadDialog, ent.dialog)
      }
    }

    this.fcmService.sendMessageNotify(ent)

    if (hasPhoneNumber(ent.text)) {
      this.mailService.sendDonationEmailFromCreateImMessage(ent)
    }

    return ent
  }

  async findUserDialogs(userId: number, {limit, skip, excludeBlocked = true}): Promise<ImDialog[]> {
    const query = this.dialogRepository
      .createQueryBuilder('dialog')

    query
      .leftJoinAndSelect('dialog.users', 'users')
      .leftJoinAndSelect('users.photos', 'photos')
      .leftJoinAndSelect('dialog.unreadByUsers', 'unreadByUsers')
      .andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('rel.imDialogId')
          .from('im_dialog_users_user', 'rel')
          .where('rel.userId = :userId')
          .getQuery()
        return `${query.alias}.id IN ${subQuery}`
      })
      .take(limit)
      .addOrderBy('dialog.lastActivityAt', 'DESC')

    if (skip) {
      query.skip(skip)
    }

    if (excludeBlocked) {
      query.andWhere('dialog.isBlocked = :excludeBlocked', {
        excludeBlocked: false,
      })
    }

    query.setParameters({userId})
    const dialogs = await query.getMany()

    const lastMessageIds = dialogs.map(d => d.lastMessageId).filter(dId => dId)
    const lastMessagesMap = new Map<number, ImMessage>()
    if (lastMessageIds.length) {
      const lastMessages = await this.messageRepository
        .find({
          relations: ['fromUser', 'fromUser.photos', 'photo'],
          where: {
            id: In(lastMessageIds),
          },
        })

      for (const m of lastMessages) {
        lastMessagesMap.set(m.id, m)
      }
    }

    for (const d of dialogs) {
      d.lastMessage = lastMessagesMap.get(d.lastMessageId) || null
    }

    return dialogs
  }

  async findDialogMessages(dialogId: number, {olderThanId, limit}): Promise<ImMessage[]> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.fromUser', 'fromUser')
      .leftJoinAndSelect('fromUser.photos', 'photos')
      .leftJoinAndSelect('message.dialog', 'dialog')
      .leftJoinAndSelect('message.photo', 'photo')
      .where('dialog.id = :dialogId', {dialogId})
      .take(limit)
      .addOrderBy('message.id', 'DESC')

    if (olderThanId) {
      query.andWhere('message.id < :olderThanId', {olderThanId})
    }

    return query.getMany()
  }

  async findDialog(dialogId: number, {excludeBlocked = true} = {}): Promise<ImDialog> {
    const where: any = {
      id: dialogId,
    }

    if (excludeBlocked) {
      where.isBlocked = false
    }

    return this.dialogRepository.findOne({
      relations: ['users', 'users.photos', 'unreadByUsers', 'users.fcmTokens'],
      where,
    })
  }

  async markDialogAsRead(dialogId: number, userId: number): Promise<ImDialog> {
    const dialog = await this.dialogRepository.findOne({
      relations: ['users', 'users.photos', 'unreadByUsers'],
      where: {id: dialogId},
    })

    const markReadFor = dialog.unreadByUsers.find(u => u.id === userId)
    dialog.unreadByUsers = dialog.unreadByUsers.filter(u => u.id !== userId)

    if (markReadFor) {
      this.wsMediator.emitMessage(markReadFor.id, WsOutEvent.ImUnreadDialogRemove, dialog)
    }

    return this.dialogRepository.save(dialog)
  }

  async blockDialog(dialog: ImDialog, userId: number): Promise<ImDialog> {
    dialog.isBlocked = true
    dialog.blockedAt = new Date()
    dialog.blockReason = DialogReasonBlock.UserBlockDialog

    dialog.blockedBy = await this.userService.findById(userId)

    for (const dialogUser of dialog.users) {
      // send info for remove dialog from list
      this.wsMediator.emitMessage(dialogUser.id, WsOutEvent.ImDialog, dialog)

      // mark as read
      this.markDialogAsRead(dialog.id, dialogUser.id)
    }

    return this.dialogRepository.save(dialog)
  }

  async findCountWithUserId(userId: number): Promise<StatisticItemDto[]> {
    const query = this.dialogRepository
      .createQueryBuilder('dialog')

    query
      .select('date("dialog"."createdAt") as ymd, count("dialog"."createdAt") as value')
      .groupBy('ymd')
      .addOrderBy('ymd', 'ASC')
      .andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('rel.imDialogId')
          .from('im_dialog_users_user', 'rel')
          .where('rel.userId = :userId')
          .getQuery()
        return `${query.alias}.id IN ${subQuery}`
      })

    query.setParameters({userId})

    const values = await query.getRawMany()

    return mapRawItemsToDto<StatisticItemDto>(values, () => new StatisticItemDto())
  }

  async removeDialogs(userId: number) {
    const query = this.dialogRepository
      .createQueryBuilder('dialog')

    query
      .leftJoinAndSelect('dialog.users', 'users')
      .leftJoinAndSelect('users.photos', 'photos')
      .andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('rel.imDialogId')
          .from('im_dialog_users_user', 'rel')
          .where('rel.userId = :userId')
          .getQuery()
        return `${query.alias}.id IN ${subQuery}`
      })

    query.setParameters({userId})

    const toRemove = await query.getMany()

    const ids = toRemove.map(d => d.id)

    await this.dialogRepository.update({
      id: In(ids),
    }, {
      blockedAt: new Date(),
      isBlocked: true,
      blockReason: DialogReasonBlock.ProfileRemove,
    })

    for (const dialog of toRemove) {
      for (const dialogUser of dialog.users) {
        // send info for remove dialog from list
        this.wsMediator.emitMessage(dialogUser.id, WsOutEvent.ImDialog, dialog)

        // mark as read
        this.markDialogAsRead(dialog.id, dialogUser.id)
      }
    }
  }
}
