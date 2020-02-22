import {HttpStatus, Injectable, Logger} from '@nestjs/common'
import {UserService} from '../user/user.service'
import * as faker from 'faker'
import * as glob from 'glob'
import {RandomUsersFormDto} from './dto/random-users-form-dto'
import {RegFormDto} from '../auth/dto/reg-form-dto'
import {PhotoService} from '../photo/photo.service'
import {User} from '../user/user.entity'
import {UserRole} from '../user/enum/user-role.enum'
import {HttpException} from '@nestjs/common/exceptions/http.exception'
import {join} from 'path'
import * as fs from 'fs'
import {depersonalizePoint} from '../../utils/geo'
import {Photo} from '../photo/photo.enity'
import {appConfig} from '../../config/app.config'
import {ChoiceService} from '../choice/choice.service'
import {arrayToBeetWiseArray} from '../../utils/algos'
import {ImDialog} from '../im/im-dialog.entity'
import {UserEditService} from '../user/user-edit.service'
import {UserGender} from '../user/enum/user-gender.enum'
import {UserUseType} from '../user/enum/user-use-type.enum'

@Injectable()
export class AdminGenerateService {
  constructor(
    private readonly userService: UserService,
    private readonly userEditService: UserEditService,
    private readonly photoService: PhotoService,
    private readonly choiceService: ChoiceService,
  ) {}

  private logger: Logger = new Logger('Admin')

  async seedUsers(form: RandomUsersFormDto): Promise<any> {
    const dtStart = +new Date()

    const faces: Photo[] = await this.copyAndSaveFaces(form.count * 2)
    const dialogs: ImDialog[] = []

    const users: User[] = []
    for (let i = 0; i < form.count; i++) {
      try {
        const u = new RegFormDto()
        u.firstname = faker.name.firstName(
          form.gender === UserGender.Male ? 0 : 1,
        )
        u.email = faker.internet.email()
        u.location = depersonalizePoint(form.location, 23500)
        u.pass = form.pass
        u.selfieId = faces[i].id
        u.useType = form.useType
        u.gender = form.gender
        u.photosIds = [faces[i].id]

        this.generateUserFields(u)

        if (faker.random.boolean() && i > 0 && faces[i * 2]) {
          u.photosIds.push(faces[i * 2].id)
        }

        const ent = await this.userEditService.createUser(u)
        users.push(ent)
        this.logger.log(`created ${i} of ${form.count}`)
      } catch (e) {
        this.logger.error(e)
      }
    }

    if (form.createDialogs) {
      const userToOtherUserMatrix = arrayToBeetWiseArray(users).map(([u, otherU]) => [u.id, otherU.id])

      for (const ids of userToOtherUserMatrix) {
        try {
          const like = await this.choiceService.like(ids[0], ids[1])
          if (like.dialog) {
            dialogs.push(like.dialog)
            this.logger.log(`created dialog between ${ids[0]}, ${ids[1]}`)
          }
        } catch (e) {
          this.logger.error(e)
        }
      }
    }

    const spentSec = (+new Date() - dtStart) / 1000
    this.logger.log(`spent time: ${spentSec.toFixed(3)} sec, ${(spentSec / 60).toFixed(1)} min`)

    return {users, dialogs}
  }

  private async copyFilesToUploads(paths: string[], count: number): Promise<string[]> {
    const fsPaths = []

    let alignedPaths = []
    if (paths.length > count) {
      alignedPaths = paths.slice(0, count)
    } else {
      const lack = Array
        .from({length: count - paths.length + 1})
        .map(() => faker.random.arrayElement(paths))
      alignedPaths.push(...lack)
    }

    await Promise.all(alignedPaths.map((p, i) => {
      const filePath = join(
        appConfig.rootPath,
        `uploads/tmp/gen.${+new Date()}.${i}.jpg`,
      )

      fsPaths.push(filePath)
      return fs.promises.copyFile(p, filePath)
    }))
    return fsPaths
  }

  private getFacesPaths(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const facesPathPattern = join(
        appConfig.rootPath,
        'fixtures/faces/*.jpg',
      )
      glob(facesPathPattern, {}, (er, files) => {
        if (er) {
          reject(er)
        }
        if (!files.length) {
          reject(new HttpException(`No files found in ${facesPathPattern}, dir: ${__dirname}`, HttpStatus.NOT_FOUND))
        }

        resolve(files)
      })
    })
  }

  async copyAndSaveFaces(count: number): Promise<Photo[]> {
    const fixturesFacesPath = await this.getFacesPaths()

    const facesPaths = await this.copyFilesToUploads(fixturesFacesPath, count)

    const faces = []
    for (let i = 0; i < facesPaths.length; i++) {
      const f = await this.photoService.createPhoto({path: facesPaths[i]})
      faces.push(f)

      this.logger.log(`uploaded ${i + 1} of ${facesPaths.length}`)
    }

    if (!faces.length) {
      throw new HttpException('No faces found', HttpStatus.NOT_FOUND)
    }

    return faces
  }

  async createAdmin(): Promise<User> {
    const existAdmin = await this.userService.findAdmin()
    if (existAdmin) {
      this.logger.warn(`Create admin skipped, early created: ${JSON.stringify({email: existAdmin.email})}`)
      return existAdmin
    }

    const faces: Photo[] = await this.copyAndSaveFaces(1)

    const pass = faker.helpers.replaceSymbols('??????')
    const email = `admin@${appConfig.domain}`

    const u = new RegFormDto()
    u.firstname = `Admin`
    u.email = email
    u.location = {
      type: 'Point',
      coordinates: [0, 0],
    }
    u.pass = pass

    u.gender = UserGender.Male
    u.useType = UserUseType.Other

    this.generateUserFields(u)

    u.selfieId = faces[0].id
    u.photosIds = [faces[0].id]

    const admin = await this.userEditService.createUser(u, {
      role: UserRole.Admin,
    })

    this.logger.warn(`Created admin user: ${JSON.stringify({email, pass})}`)

    return admin
  }

  private generateUserFields(u: RegFormDto) {
    const age = faker.random.number({min: 20, max: 40})

    u.bday = new Date(+new Date() - age * 24 * 3600 * 365 * 1000)
    u.weight = faker.random.number({min: 40, max: 90})
    u.height = faker.random.number({min: 120, max: 200})
    u.bio = ''
    u.acceptedUseDataInScience = true
    u.tolerantPromise = true
    u.honestyAndGoodnessPromise = true
    u.tos = true
  }
}
