import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: String(process.env.DB_HOST),
  port: Number(process.env.DB_PORT),
  username: String(process.env.DB_USERNAME),
  password: String(process.env.DB_PASS),
  database: String(process.env.DB_NAME),
}

export = config
