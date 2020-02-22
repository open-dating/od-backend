import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {User} from './user.entity'
import {UserRole} from './enum/user-role.enum'
import {Photo} from '../photo/photo.enity'
import {Repository} from 'typeorm'
import {Choice, ChoiceType} from '../choice/choice.entity'
import {getHashOfPass} from '../../utils/crypto'
import {transformInputEmailToValidFormat} from '../../utils/transformers'
import {ItemsListDto} from '../shared/dto/items-list-dto'
import {Feature} from '@turf/turf'
import {DemographyStatDto} from './dto/demography-stat-dto'
import {UserUseType} from './enum/user-use-type.enum'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  async findCredential(email: string, pass: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      relations: ['selfie', 'photos', 'setting', 'unreadDialogs', 'habits'],
      where: {
        email: transformInputEmailToValidFormat(email),
        passHash: getHashOfPass(pass),
        isRemoved: false,
      },
    })
  }

  async findById(id): Promise<User | undefined> {
    return this.userRepository.findOne({
      relations: ['selfie', 'photos', 'setting', 'unreadDialogs', 'habits', 'fcmTokens'],
      where: {id},
    })
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      relations: ['selfie', 'photos', 'setting', 'unreadDialogs', 'habits'],
      where: {
        email: transformInputEmailToValidFormat(email),
      },
    })
  }

  async findAdmin(): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: {
        role: UserRole.Admin,
      },
    })
  }

  async findNearUsers(userId): Promise<User[]> {
    const currUser = await this.findById(userId)

    const query = this.userRepository
      .createQueryBuilder(`user`)
      .leftJoinAndSelect(`user.selfie`, `selfie`)
      .leftJoinAndSelect(`user.photos`, `photos`)
      .leftJoinAndSelect(`user.habits`, `habits`)
    const params: any = {}

    /**
     * not removed
     */
    query
      .andWhere(`user.isRemoved != TRUE`)

    /**
     * age restrictions
     */
    params.maxBday = new Date(+new Date() - currUser.setting.minAge * 365.25 * 24 * 3600 * 1000).toISOString()
    params.minBday = new Date(+new Date() - currUser.setting.maxAge * 365.25 * 24 * 3600 * 1000).toISOString()
    query
      .andWhere(`user.bday BETWEEN :minBday AND :maxBday`)
    // console.log(params.minBday, params.maxBday)

    /**
     * gender restrictions
     */
    params.searchGender = currUser.setting.searchGender
    query
      .andWhere(`user.gender = :searchGender`)

    /**
     * use type restriction
     */
    params.useType = currUser.useType
    query
      .andWhere(`user.useType = :useType`)

    if (currUser.useType === UserUseType.Rel) {
      // TODO: enable habits restrictions
    }

    /**
     * search near users in sphere with radius
     */
    params.origin = JSON.stringify(currUser.location)
    params.radius = currUser.setting.searchRadius

    const locDistName = `${query.alias}_locationDistance`
    query
      .addSelect(`ST_DistanceSphere("${query.alias}"."location", ST_GeomFromGeoJSON(:origin))`, locDistName)
      .andWhere(`ST_DWithin("${query.alias}"."location", ST_GeomFromGeoJSON(:origin), :radius, TRUE)`)
      .addOrderBy(`"${locDistName}"`, 'ASC')

    /**
     * order users by euclidean distance
     * @link https://github.com/ageitgey/face_recognition/blob/d7e6898c2dc10c58431b8bc47439ad9a5996c14a/face_recognition/api.py#L63
     */
    const cubeDistName = `${query.alias}_cubeDistance`
    query
      .addSelect(`euclidean_distance("selfie"."faceEncoding", :currFaceEncoding)`, cubeDistName)
      .addOrderBy(`"${cubeDistName}"`, 'DESC')
    params.currFaceEncoding = `{${currUser.selfie.faceEncoding.join(',')}}`
    /**
     * We cant use cube, reason: only 100 dim supported
     * @link https://www.postgresql.org/docs/current/cube.html
     */
    // query.addSelect(`cube_distance(cube("${query.alias}"."faceEncoding"), cube('(${currUser.faceEncoding.join(',')})'))`, cubeDistName)

    /**
     * Except users which curr user liked/passed early
     */
    params.currUserId = currUser.id
    query.andWhere(qb => {
      const subQuery = qb.subQuery()
        .select('choice.toUser')
        .from(Choice, 'choice')
        .where('choice.fromUser = :currUserId')
        .getQuery()
      return `${query.alias}.id NOT IN ${subQuery}`
    })

    /**
     * Except curr user
     */
    query.andWhere('user.id != :currUserId')

    const possibleMatchQuery = query.clone()
    const possibleMatchParams = {...params}
    /**
     * Add user which like curr user early
     */
    possibleMatchQuery.andWhere(qb => {
      const subQuery = qb.subQuery()
        .select('choice.fromUser')
        .from(Choice, 'choice')
        .where('choice.toUser = :currUserId')
        .andWhere('choice.type = :like')
        .getQuery()
      return `${query.alias}.id IN ${subQuery}`
    })
    possibleMatchParams.like = ChoiceType.LIKE

    // apply params
    query.setParameters(params)
    possibleMatchQuery.setParameters(possibleMatchParams)

    // console.log(query.getSql())
    // console.log(possibleMatchQuery.getSql())

    const [users, possibleMatchUsers] = await Promise.all([
      query.limit(10).getMany(),
      possibleMatchQuery.limit(3).getMany(),
    ])

    const addedIds = []
    const uniqUsers = [users, possibleMatchUsers]
      .flatMap(v => v)
      .filter(u => {
        if (addedIds.indexOf(u.id) === -1) {
          addedIds.push(u.id)
          return true
        }
        return false
      })

    return uniqUsers
  }

  async getUsers(ids: number[]): Promise<User[]> {
    const users = await this.userRepository.findByIds(ids, {
      relations: ['fcmTokens', 'photos', 'setting', 'habits'],
    })

    // re-order
    return ids.map(id => users.find(u => +u.id === +id))
  }

  async getUsersList(page: number, limit: number): Promise<ItemsListDto<User>> {
    const items = await this.userRepository.find({
      relations: ['selfie', 'photos', 'fcmTokens', 'setting', 'complaintsToUser', 'habits'],
      skip: Number((page - 1) * limit),
      take: limit,
      order: {
        id: 'ASC',
      },
    })

    const totalCount = await this.userRepository.count()

    return new ItemsListDto<User>(items, {
      page,
      limit,
      perPage: limit,
      totalCount,
    })
  }

  async getUserDemographyStat(geoJson: Feature): Promise<DemographyStatDto[]> {
    const query = this.userRepository
      .createQueryBuilder('user')

    query
      .select('extract(year from "user"."bday") as bdayYYYY, "user"."gender" as gender, count(*) as count')
      .addGroupBy('gender')
      .addGroupBy('bdayYYYY')

    query
      .where(`ST_Intersects("user"."location"::geometry, ST_SetSRID(ST_GeomFromGeoJSON(:poly), 4326))`)

    query.setParameters({poly: JSON.stringify(geoJson.geometry)})

    // console.log(query.getQuery())

    return query.getRawMany()
  }
}
