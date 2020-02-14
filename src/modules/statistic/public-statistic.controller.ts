import {Controller, Get} from '@nestjs/common'
import {ApiResponse, ApiTags} from '@nestjs/swagger'
import {PublicStatisticService} from './public-statistic.service'
import {CountryBoundsList} from 'osm-countries-bounds/lib/src/interfaces/CountryBoundsList'
import {DemographyDto} from './dto/demography-dto'

@ApiTags('statistic')
@Controller()
export class PublicStatisticController {
  constructor(
    private readonly publicStatisticService: PublicStatisticService,
  ) {}

  @Get('/api/v1/statistic/public/countries/bounds')
  async countriesBounds(): Promise<CountryBoundsList> {
    return this.publicStatisticService.getCountriesBounds()
  }

  @Get('/api/v1/statistic/public/demography/by-countries')
  @ApiResponse({
    type: DemographyDto,
  })
  async demographyByCountries(): Promise<DemographyDto> {
    return this.publicStatisticService.getDemographyStatByCountries()
  }
}
