import {Module} from '@nestjs/common'
import {Complaint} from './complaint.entity'
import {TypeOrmModule} from '@nestjs/typeorm'
import {ComplaintController} from './complaint.controller'
import {ComplaintService} from './complaint.service'
import {UserModule} from '../user/user.module'

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      Complaint,
    ]),
  ],
  controllers: [
    ComplaintController,
  ],
  providers: [
    ComplaintService,
  ],
  exports: [
    ComplaintService,
  ],
})

export class ComplaintModule {}
