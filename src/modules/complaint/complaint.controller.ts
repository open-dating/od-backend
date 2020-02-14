import {ApiBearerAuth, ApiBody, ApiResponse, ApiTags} from '@nestjs/swagger'
import {Body, Controller, Post, Request, UseGuards, UseInterceptors} from '@nestjs/common'
import {AuthGuard} from '@nestjs/passport'
import {ComplaintService} from './complaint.service'
import {RestDataProtectInterceptor} from '../shared/interceptors/rest-data-protect.interceptor'
import {Complaint} from './complaint.entity'
import {ComplaintFormDto} from './dto/complaint-form.dto'

@ApiTags('complaint')
@ApiBearerAuth()
@Controller()
@UseInterceptors(RestDataProtectInterceptor())
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/api/v1/complaint/create')
  @ApiBody({
    type: ComplaintFormDto,
  })
  @ApiResponse({
    type: Complaint,
  })
  async createComplaint(@Request() req, @Body() form: ComplaintFormDto): Promise<Complaint> {
    return this.complaintService.createComplaint(+req.user.id, form)
  }
}
