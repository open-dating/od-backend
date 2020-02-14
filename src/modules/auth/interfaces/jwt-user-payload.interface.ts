import {UserRole} from '../../user/enum/user-role.enum'

export interface JwtUserPayload {
  id: number
  email: string
  role: UserRole
}
