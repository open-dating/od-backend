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
  Logger.log(`Adminer on http://0.0.0.0:4301/?pgsql=${ormCommonConfig.host}&username=${ormCommonConfig.username}&db=${ormCommonConfig.database}&ns=public`)

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

  Logger.log(`Run on http://0.0.0.0:${appConfig.port}`)
  Logger.log(`Swagger UI on http://0.0.0.0:${appConfig.port}/api/v1/doc`)
  Logger.log(`WebSocket on http://0.0.0.0:${appConfig.port}/api/v1/ws?token=jwt_token Ws doc: http://0.0.0.0:${appConfig.port}/static/ws.html`)

  await app.select(AdminModule).get(AdminGenerateService).createAdmin()
}

bootstrap()
