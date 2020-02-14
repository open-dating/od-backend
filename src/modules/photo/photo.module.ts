import {Module} from '@nestjs/common'
import {PhotoService} from './photo.service'
import {PhotoController} from './photo.controller'
import {TypeOrmModule} from '@nestjs/typeorm'
import {Photo} from './photo.enity'

@Module({
  imports: [TypeOrmModule.forFeature([Photo])],
  controllers: [PhotoController],
  providers: [PhotoService],
  exports: [PhotoService],
})
export class PhotoModule {}
