import {ImDialog} from '../../im/im-dialog.entity'
import {ApiProperty} from '@nestjs/swagger'
import {Exclude, Expose} from 'class-transformer'

@Exclude()
export class LikeDto {
  @ApiProperty({type: ImDialog})
  @Expose()
  dialog: ImDialog|null

  @ApiProperty()
  @Expose()
  exist: boolean
}
