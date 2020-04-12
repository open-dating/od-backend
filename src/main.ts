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

  Logger.log(`Adminer on http://${appConfig.internalIp}:4301/?pgsql=od-backend-postgres&username=${ormCommonConfig.username}&db=${ormCommonConfig.database}&ns=public`)
  Logger.log(`Go to fcm console and get own firebase config and put to fcm.json for debug fcm`)
  Logger.log(`Run on ${appConfig.host}`)
  Logger.log(`If ${appConfig.host} wrong you can insert value in .env as: HOST=http://10.77.16.75:${appConfig.port}`)
  Logger.log(`Swagger UI on ${appConfig.host}/api/v1/doc`)
  Logger.log(`WebSocket on ${appConfig.host}/api/v1/ws?token=jwt_token Ws doc: ${appConfig.host}/static/ws.html`)
  Logger.log(`Mode=${process.env.NODE_ENV}`)
  Logger.log(`rootPath=${appConfig.rootPath}`)

  await app.select(AdminModule).get(AdminGenerateService).createAdmin()
}

bootstrap()
