import {ConnectionOptions} from 'typeorm'
import * as ormCommonConfig from './orm.common'
import {entities} from '../modules/shared/entities'

const config: ConnectionOptions = {
  ...ormCommonConfig,

  // We are using migrations, synchronize should be set to false.
  synchronize: false,

  // Run migrations automatically,
  // you can disable this if you prefer running migration manually.
  migrationsRun: true,
  logging: true,

  // allow both start:prod and start:dev to use migrations
  // __dirname is either dist or src folder, meaning either
  // the compiled js in prod or the ts in dev
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },

  entities,
}

export = config
