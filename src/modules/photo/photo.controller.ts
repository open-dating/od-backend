import {ApiBody, ApiConsumes, ApiResponse, ApiTags} from '@nestjs/swagger'
import {Controller, Post, UploadedFile, UseInterceptors} from '@nestjs/common'
import {FileInterceptor} from '@nestjs/platform-express'
import {PhotoUploadDto} from './dto/photo-upload'
import {diskStorage} from 'multer'
import * as mimeDb from 'mime-db'
import {PhotoService} from './photo.service'
import {appConfig} from '../../config/app.config'
import * as path from 'path'
import {Photo} from './photo.enity'
import {RestDataProtectInterceptor} from '../shared/interceptors/rest-data-protect.interceptor'
import {UserRole} from '../user/enum/user-role.enum'

@ApiTags('photo')
@Controller()
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post('/api/v1/photo/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: path.join(appConfig.rootPath, 'uploads/tmp'),
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
        return cb(null, `photo.${randomName}.${
          mimeDb[file.mimetype] ? mimeDb[file.mimetype].extensions[0] : 'unknown'
        }`)
      },
    }),
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: PhotoUploadDto,
  })
  @ApiResponse({type: Photo})
  @UseInterceptors(RestDataProtectInterceptor({addRoles: [UserRole.Owner]}))
  async upload(@UploadedFile() file): Promise<Photo> {
    return this.photoService.createPhoto(file)
  }
}
