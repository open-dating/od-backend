import {User} from '../../user/user.entity'
import {ImDialog} from '../../im/im-dialog.entity'
import {ApiProperty} from '@nestjs/swagger'

export class SeededUsersDto {
  @ApiProperty({
    type: [User],
  })
  users: User[]

  @ApiProperty({
    type: [ImDialog],
  })
  dialogs: ImDialog[]
}
