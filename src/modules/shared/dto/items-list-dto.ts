import {ApiProperty} from '@nestjs/swagger'
import {Exclude, Expose} from 'class-transformer'

type Record<K extends keyof any, T> = {
  [P in K]: T
}

@Exclude()
export class ItemsListDto<T> {
  @Expose()
  @ApiProperty()
  data: T[]

  @Expose()
  @ApiProperty()
  // tslint:disable-next-line:variable-name
  _meta: Record<string, any>

  constructor(data: T[], meta: Record<string, any>) {
    this.data = data
    this._meta = meta
  }
}
