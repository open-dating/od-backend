import {MigrationInterface, QueryRunner} from 'typeorm'
import * as fs from 'fs'
import * as path from 'path'

export class Base1586635661537 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    const sql = fs.readFileSync(
      path.join(
        process.env.ROOT_PATH,
        'src/migrations',
        '1586635661537-Base.sql',
      ),
    )
    await queryRunner.query(sql.toString())
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    throw Error('Cant revert base schema')
  }

}
