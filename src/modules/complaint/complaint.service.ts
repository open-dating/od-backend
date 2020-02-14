import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {Complaint} from './complaint.entity'
import {ComplaintFormDto} from './dto/complaint-form.dto'
import * as stripHtml from 'string-strip-html'
import {UserService} from '../user/user.service'
import {ItemsListDto} from '../shared/dto/items-list-dto'
import {ComplaintStatus} from './enum/complaint-status.enum'

export class ComplaintService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Complaint)
    private readonly complaintRepository: Repository<Complaint>,
  ) {
  }

  async createComplaint(fromUserId: number, form: ComplaintFormDto): Promise<Complaint> {
    const [fromUser, toUser] = await this.userService.getUsers([fromUserId, form.toUserId])

    const ent = this.complaintRepository.create()
    ent.fromUser = fromUser
    ent.toUser = toUser
    ent.text = stripHtml(String(form.text || ''))
    ent.dialogId = form.dialogId ? Number(form.dialogId) : null
    ent.location = stripHtml(String(form.location || ''))
    ent.status = ComplaintStatus.New
    ent.createdAt = new Date()

    return this.complaintRepository.save(ent)
  }

  async getComplaintsList(page: number, limit: number): Promise<ItemsListDto<Complaint>> {
    const items = await this.complaintRepository.find({
      relations: ['fromUser', 'toUser'],
      skip: Number((page - 1) * limit),
      take: limit,
    })

    const totalCount = await this.complaintRepository.count()

    return new ItemsListDto<Complaint>(items, {
      page,
      limit,
      perPage: limit,
      totalCount,
    })
  }
}
