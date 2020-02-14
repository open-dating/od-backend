import {Module} from '@nestjs/common'
import {UserService} from './user.service'
import {UserEditService} from './user-edit.service'
import {UserController} from './user.controller'
import {UserEditController} from './user-edit.controller'
import {User} from './user.entity'
import {Photo} from '../photo/photo.enity'
import {UserFcm} from './user-fcm.entity'
import {UserSetting} from './user-setting.entity'
import {TypeOrmModule} from '@nestjs/typeorm'
import {UserHabits} from './user-habits.entity'

@Module({
  imports: [TypeOrmModule.forFeature([
    User,
    Photo,
    UserFcm,
    UserSetting,
    UserHabits,
  ])],
  controllers: [
    UserController,
    UserEditController,
  ],
  providers: [
    UserService,
    UserEditService,
  ],
  exports: [
    UserService,
    UserEditService,
  ],
})
export class UserModule {}
