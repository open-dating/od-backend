import {Module} from '@nestjs/common'
import {AdminController} from './admin.controller'
import {AdminGenerateService} from './admin-generate.service'
import {UserModule} from '../user/user.module'
import {PhotoModule} from '../photo/photo.module'
import {ChoiceModule} from '../choice/choice.module'
import {ComplaintModule} from '../complaint/complaint.module'

@Module({
  imports: [
    UserModule,
    PhotoModule,
    ChoiceModule,
    ComplaintModule,
  ],
  controllers: [AdminController],
  providers: [AdminGenerateService],
  exports: [AdminGenerateService],
})
export class AdminModule {}
