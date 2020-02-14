import {MigrationInterface, QueryRunner} from 'typeorm'

export class PGFunctions1578436764512 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    /**
     * x1 = [1,1]
     * x2 = [2,9]
     * eudistance = math.sqrt(math.pow(x1[0]-x2[0],2) + math.pow(x1[1]-x2[1],2) )
     * @link https://www.techtrekking.com/how-to-calculate-euclidean-and-manhattan-distance-by-using-python/
     */
    await queryRunner.query(`
CREATE OR REPLACE FUNCTION euclidean_distance(l float8[], r float8[]) RETURNS float8 AS $$
DECLARE
  s float8;
BEGIN
  s := 0;
  IF l IS NOT NULL AND r IS NOT NULL THEN
    FOR i IN 1..array_upper(l, 1) LOOP
      s := s + pow(l[i] - r[i], 2);
    END LOOP;
    s := sqrt(s);
  END IF;
  RETURN |/ s;
END;
$$ LANGUAGE plpgsql;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP FUNCTION IF EXISTS euclidean_distance`)
  }

}
