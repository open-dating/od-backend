import {HttpStatus, Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {User} from './user.entity'
import {Photo} from '../photo/photo.enity'
import {Repository} from 'typeorm'
import {depersonalizePoint} from '../../utils/geo'
import {Point} from '@turf/turf'
import {EditFormDto} from './dto/edit-form-dto'
import {UserFcm} from './user-fcm.entity'
import {RegFormDto} from '../auth/dto/reg-form-dto'
import {UserRole} from './enum/user-role.enum'
import {HttpException} from '@nestjs/common/exceptions/http.exception'
import {getCustomValidationError} from '../../utils/validation'
import {getHashOfPass} from '../../utils/crypto'
import {UserSetting} from './user-setting.entity'
import {UserGender} from './enum/user-gender.enum'
import * as stripHtml from 'string-strip-html'
import {transformInputEmailToValidFormat} from '../../utils/transformers'
import {SettingsFormDto} from './dto/settings-form-dto'
import {UserHabits} from './user-habits.entity'
import {UserReasonRemove} from './enum/user-reason-remove.enum'

@Injectable()
export class UserEditService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    @InjectRepository(UserFcm)
    private readonly userFcmRepository: Repository<UserFcm>,
    @InjectRepository(UserSetting)
    private readonly userSettingRepository: Repository<UserSetting>,
    @InjectRepository(UserHabits)
    private readonly userHabitsRepository: Repository<UserHabits>,
  ) {}

  async createUser(form: RegFormDto, {
    role,
  }: {
    role?: UserRole,
  } = {}): Promise<User> {
    const ent = this.userRepository.create(form)
    ent.firstname = stripHtml(form.firstname)
    ent.bio = stripHtml(form.bio || '')
    ent.acceptedUseDataInScience = Boolean(form.acceptedUseDataInScience)
    ent.passHash = getHashOfPass(form.pass)
    ent.email = transformInputEmailToValidFormat(form.email)
    ent.location = depersonalizePoint(form.location)
    ent.role = role ? role : UserRole.User
    ent.unreadDialogs = []
    ent.language = stripHtml(form.language || 'en')

    ent.habits = this.userHabitsRepository.create(form.habits || {})

    ent.setting = new UserSetting()
    ent.setting.minAge = 18
    ent.setting.maxAge = 70
    ent.setting.searchRadius = 500000
    ent.setting.searchGender = ent.gender === UserGender.Male ? UserGender.Female : UserGender.Male

    const existUser = await this.userRepository.findOne({
      where: [
        {email: ent.email},
      ],
    })
    if (existUser) {
      throw new HttpException({
        message: [
          getCustomValidationError('email', 'Email must be unique'),
        ],
      }, HttpStatus.BAD_REQUEST)
    }

    const photoEnt = await this.photoRepository.findOne(Number(form.selfieId))
    if (!photoEnt) {
      throw new HttpException({
        message: [
          getCustomValidationError('selfieId', 'Need selfie image'),
        ],
      }, HttpStatus.BAD_REQUEST)
    }
    if (!(photoEnt.faceEncoding && Array.isArray(photoEnt.faceEncoding) && photoEnt.allFacesEncoding.length === 1)) {
      throw new HttpException({
        message: [
          getCustomValidationError('selfieId', `Face not found on selfie, or more than one selfie in image with id: ${photoEnt.id}`),
        ],
      }, HttpStatus.BAD_REQUEST)
    }
    if (photoEnt.isNSFW) {
      throw new HttpException({
        message: [
          getCustomValidationError('selfieId', `Selfie cant be nude, id: ${photoEnt.id}`),
        ],
      }, HttpStatus.BAD_REQUEST)
    }

    ent.selfie = photoEnt

    ent.photos = await this.photoRepository.findByIds(form.photosIds)
    for (const p of ent.photos) {
      if (p.isNSFW) {
        throw new HttpException({
          message: [
            getCustomValidationError('photosIds', `Photos cant be nude, id: ${p.id}`),
          ],
        }, HttpStatus.BAD_REQUEST)
      }
    }

    return this.userRepository.save(ent)
  }

  async updateUserLastActive(id: number) {
    return this.userRepository.update({
      id,
    }, {
      lastActiveAt: () => 'CURRENT_TIMESTAMP',
    })
  }

  async updateUserGeoLocation(id: number, location: Point) {
    return this.userRepository.update({
      id,
    }, {
      location: depersonalizePoint(location),
    })
  }

  async updateUserLang(id: number, lang: string) {
    return this.userRepository.update({
      id,
    }, {
      language: stripHtml(lang),
    })
  }

  async updateProfileFields(id: number, form: EditFormDto): Promise<User> {
    const user = await this.userRepository.findOne({
      relations: ['selfie', 'photos', 'setting', 'unreadDialogs', 'habits'],
      where: {id},
    })

    user.photos = await this.photoRepository.findByIds(form.photosIds)
    user.weight = form.weight
    user.bio = stripHtml(form.bio)

    if (form.habits) {
      user.habits = {
        ...user.habits,
        ...form.habits,
      }
    }

    await this.userRepository.save(user)

    return user
  }

  async saveOrRemoveFcmToken(id: number, token: string, remove = false): Promise<User> {
    const user = await this.userRepository.findOne({
      relations: ['fcmTokens'],
      where: {id},
    })

    // tslint:disable-next-line:no-shadowed-variable
    for (const t of user.fcmTokens) {
      if (t.token === token) {
        if (remove) {
          await this.userFcmRepository.remove(t)
        }
        return user
      }
    }

    const t = new UserFcm()
    t.user = user
    t.token = token
    await this.userFcmRepository.save(t)

    user.fcmTokens.push(t)

    return user
  }

  async changePass(user: User, newPass: string): Promise<User> {
    user.passHash = getHashOfPass(newPass)
    return this.userRepository.save(user)
  }

  async updateProfileSettings(id: number, form: SettingsFormDto): Promise<User> {
    const user = await this.userRepository.findOne({
      relations: ['setting'],
      where: {id},
    })

    user.setting.searchGender = form.searchGender
    user.setting.searchRadius = form.searchRadius
    user.setting.maxAge = form.maxAge
    user.setting.minAge = form.minAge

    await this.userRepository.save(user)

    return user
  }

  async removeProfile(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      relations: ['fcmTokens', 'photos'],
      where: {id},
    })

    user.isRemoved = true
    user.removedAt = new Date()
    user.reasonRemove = UserReasonRemove.RemovedByUser

    const tokens = await this.userFcmRepository.find({
      where: {user},
    })
    await this.userFcmRepository.remove(tokens)

    await this.userRepository.save(user)
  }
}
