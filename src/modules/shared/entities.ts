import {User} from '../user/user.entity'
import {Photo} from '../photo/photo.enity'
import {Choice} from '../choice/choice.entity'
import {ImDialog} from '../im/im-dialog.entity'
import {ImMessage} from '../im/im-message.entity'
import {UserFcm} from '../user/user-fcm.entity'
import {UserSetting} from '../user/user-setting.entity'
import {UserHabits} from '../user/user-habits.entity'
import {Complaint} from '../complaint/complaint.entity'

// list of all entites, for use in cli for autogen migration and in app module
export const entities = [
  User,
  Photo,
  Choice,
  ImDialog,
  ImMessage,
  UserFcm,
  UserSetting,
  UserHabits,
  Complaint,
]
