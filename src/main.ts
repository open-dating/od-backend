import {NestExpressApplication} from '@nestjs/platform-express'
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger'
import {AppModule} from './app.module'
import {Logger, ValidationPipe} from '@nestjs/common'
import {appConfig} from './config/app.config'
import * as ormCommonConfig from './config/orm.common'
import * as pkg from '../package.json'
import {NestFactory} from '@nestjs/core'
import {join} from 'path'
import {AdminModule} from './modules/admin/admin.module'
import {AdminGenerateService} from './modules/admin/admin-generate.service'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  })

  app.useStaticAssets(join(__dirname, '../../', 'static'), {
    index: false,
    prefix: '/static',
  })

  app.useStaticAssets(join(__dirname, '../../', 'uploads'), {
    index: false,
    prefix: '/uploads',
  })

  app.useGlobalPipes(new ValidationPipe())

  const options = new DocumentBuilder()
    .setTitle(pkg.name)
    .setVersion(pkg.version)
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api/v1/doc', app, document)

  await app.listen(appConfig.port)

  Logger.log(`Adminer on http://0.0.0.0:4301/?pgsql=${ormCommonConfig.host}&username=${ormCommonConfig.username}&db=${ormCommonConfig.database}&ns=public`)
  Logger.log(`You can create .env file and put into variables, e.g.: HOST=http://10.77.16.75:4300 for easy cross-platform development`)
  Logger.log(`Go to fcm console and get own firebase config and put to fcm.json for debug fcm`)
  Logger.log(`Run on ${appConfig.host}`)
  Logger.log(`Swagger UI on ${appConfig.host}/api/v1/doc`)
  Logger.log(`WebSocket on ${appConfig.host}/api/v1/ws?token=jwt_token Ws doc: ${appConfig.host}/static/ws.html`)
  Logger.log(`Mode=${process.env.NODE_ENV}`)

  await app.select(AdminModule).get(AdminGenerateService).createAdmin()
}

bootstrap()
