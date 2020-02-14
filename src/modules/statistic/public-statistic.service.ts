import {Injectable, Logger} from '@nestjs/common'
import {getBoundsOfCountries, getAvailableCountries, getBoundsOfCountryByIsoAlpha2Code} from 'osm-countries-bounds'
import {CountryBoundsList} from 'osm-countries-bounds/lib/src/interfaces/CountryBoundsList'
import {UserService} from '../user/user.service'
import {DemographyDto} from './dto/demography-dto'

@Injectable()
export class PublicStatisticService {

  private demographyStatByCountries: DemographyDto
  private demographyStatByCountriesCalcAt: Date
  private demographyStatByCountriesCalcInProgress: boolean

  private logger: Logger = new Logger('PublicStatisticService')

  constructor(
    private readonly userService: UserService,
  ) {
  }

  getCountriesBounds(): CountryBoundsList {
    return getBoundsOfCountries()
  }

  async getDemographyStatByCountries(): Promise<DemographyDto> {
    const hours12 = 12 * 3600 * 1000
    if (
      !this.demographyStatByCountriesCalcInProgress
      && !this.demographyStatByCountries
      || +this.demographyStatByCountriesCalcAt + hours12 < +new Date()
    ) {
      this.demographyStatByCountriesCalcInProgress = true

      this.demographyStatByCountries = await this.calcDemographyStatByCountries()
      this.demographyStatByCountriesCalcAt = new Date()

      this.demographyStatByCountriesCalcInProgress = false
    }

    return this.demographyStatByCountries
  }

  private async calcDemographyStatByCountries(): Promise<DemographyDto> {
    const startAt = +new Date()
    this.logger.log('calcDemographyStatByCountries start')

    const out: DemographyDto = {}
    const list = getAvailableCountries()

    for (const alpha2 of list) {
      const feature = getBoundsOfCountryByIsoAlpha2Code(alpha2).features[0]
      const raw = await this.userService.getUserDemographyStat(feature)
      out[alpha2] = {
        raw,
        countryName: feature.properties.namedetails['name:en'],
      }
    }

    this.logger.log(`calcDemographyStatByCountries end, time: ${+new Date() - startAt}ms`)

    return out
  }
}
