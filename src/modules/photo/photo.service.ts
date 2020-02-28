import {HttpStatus, Injectable, Logger} from '@nestjs/common'
import {Repository} from 'typeorm'
import {Photo} from './photo.enity'
import {InjectRepository} from '@nestjs/typeorm'
import {appConfig} from '../../config/app.config'
import got from 'got'
import * as FormData from 'form-data'
import * as fs from 'fs'
import * as sharp from 'sharp'
import * as path from 'path'
import * as uuid from 'uuid/v4'
import {HttpException} from '@nestjs/common/exceptions/http.exception'
import {SavedFile} from './interfaces/saved-file.interface'

@Injectable()
export class PhotoService {
  private logger: Logger = new Logger('PhotoService')

  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  async createPhoto(file: SavedFile): Promise<Photo> {
    const createDt = {
      total: [0, 0],
      convert: [0, 0],
      checkForNSFW: [0, 0],
      encodingAndLandmarks: [0, 0],
      dnnChecks: [0, 0],
    }
    createDt.total[0] = +new Date()

    const ent = new Photo()
    ent.filePath = file.path

    createDt.convert[0] = +new Date()
    try {
      await this.convert(ent)
    } catch (e) {
      fs.unlinkSync(ent.filePath)
      throw new HttpException({
        message: `Is not a photo or unknown photo format: ${e.toString()}`,
      }, HttpStatus.BAD_REQUEST)
    }
    createDt.convert[1] = +new Date()

    createDt.dnnChecks[0] = +new Date()
    try {
      await Promise.all([
        this.checkForNSFW(ent, createDt.checkForNSFW),
        this.detectEncodingAndLandmarks(ent, createDt.encodingAndLandmarks),
      ])
    } catch (e) {
      // we thrown exception only have error on check of nsfw score
      fs.unlinkSync(ent.filePath)
      throw new HttpException({
        message: `NSFW check failed: ${e.toString()}`,
      }, HttpStatus.BAD_REQUEST)
    }
    createDt.dnnChecks[1] = +new Date()

    // remove orig file
    fs.unlinkSync(file.path)

    await this.photoRepository.save(ent)

    createDt.total[1] = +new Date()
    for (const key of Object.keys(createDt)) {
      this.logger.log(`${ent.id}: ${key}, spent time: ${((createDt[key][1] - createDt[key][0]) / 1000).toFixed(3)} sec`)
    }

    return ent
  }

  async convert(ent: Photo) {
    const outFilePath = path.join(
      appConfig.rootPath,
      'uploads/photo',
      `${uuid()}.jpg`,
    )

    const {width, height} = await sharp(ent.filePath)
      .rotate()
      .resize(appConfig.image.w, appConfig.image.h, {
        fit: 'inside',
      })
      .jpeg({
        progressive: true,
        quality: appConfig.image.quality,
      })
      .toFile(outFilePath)

    ent.width = width
    ent.height = height
    ent.filePath = outFilePath
  }

  async detectEncodingAndLandmarks(ent: Photo, timeMark = [0, 0]) {
    timeMark[0] =  +new Date()

    try {
      await Promise.all([
        this.detectEncoding(ent),
        this.detectLandmarks(ent),
      ])
    } catch (e) {
      this.logger.warn(`Cant recognize face in ${ent.filePath}: ${e.toString()}`)
    }

    timeMark[1] = +new Date()
  }

  async detectEncoding(ent: Photo) {
    const body = new FormData()
    body.append('image', fs.createReadStream(ent.filePath))

    const resp: any = await got.post(`${appConfig.dnnFaceUrl}/api/v1/face-encodings`, {
      body,
    }).json()

    ent.faceEncoding = resp.face_encodings_list[0]
    ent.allFacesEncoding = resp.face_encodings_list
    ent.faceCount = resp.face_encodings_list.length
  }

  async detectLandmarks(ent: Photo) {
    const body = new FormData()
    body.append('image', fs.createReadStream(ent.filePath))

    const resp: any = await got.post(`${appConfig.dnnFaceUrl}/api/v1/face-landmarks`, {
      body,
    }).json()

    ent.allFacesLandmarks = resp.face_landmarks_list
    ent.faceCount = resp.face_landmarks_list.length
  }

  async checkForNSFW(ent: Photo, timeMark = [0, 0]) {
    timeMark[0] = +new Date()

    const body = new FormData()
    body.append('image', fs.createReadStream(ent.filePath))
    body.append('disableAnAlgorithm', 'true')

    const resp: any = await got.post(`${appConfig.dnnNSFWUrl}/api/v1/detect`, {
      body,
    }).json()

    ent.openNSFWScore = resp.open_nsfw_score

    timeMark[1] = +new Date()
  }

  findById(id: number) {
    return this.photoRepository.findOne(id)
  }
}
