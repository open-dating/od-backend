import {UserGender} from '../enum/user-gender.enum'

export class DemographyStatDto {
  gender: UserGender
  bdayYYYY: string
  count: number
}
