import {DemographyStatDto} from '../../user/dto/demography-stat-dto'

export class DemographyDto {
  [aplha2CountryCode: string]: {
    countryName: string,
    raw: DemographyStatDto[],
  }
}
