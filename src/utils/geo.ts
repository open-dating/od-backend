import {BBox, Position, point, destination, randomPoint, Point, distance} from '@turf/turf'

/**
 * Точность	Пример	Погрешность (вдоль меридина)	Погрешность вдоль параллели 55.75	Применение
 * 1 градус	56,38	111 км	63 км	Континент, страна (кроме карликовых)
 *  0.1 градуса	55.8,37.6	11.1 км	6.3 км	Область, крупный город
 * 0.01 градуса	55.75,37.62	1110 м	630 м	Город, район, штат
 * 0.001 градуса	55.754,37.620	111 м	63 м	Район города, водоём
 *  0.0001 градуса	55.7541,37.6204	11 м	6.3 м	Деревня, площадь, участок
 *  0.00001 градуса	55.75412,37.62044	1.1 м	0.63 м	Здание, POI, место встречи
 *  0.000001 градуса	55.754124,37.620437	11 см	6.3 см	Входная дверь
 *  0.0000001 градуса	55.7541240,37.6204368	1.1 см	0.63 см	Точная отрисовка
 * @link https://overquantum.livejournal.com/17741.html
 * @param lon
 * @param lat
 * @returns {number[]}
 */
export function roundCoords(lon = 0, lat = 0): Position {
  return [
    +lon.toFixed(4),
    +lat.toFixed(4),
  ]
}

export function depersonalizePoint(location: Point, dist = 1200): Point {
  const [lon, lat] = location.coordinates
  const origPoint = point([lon, lat])

  const top = destination(
    origPoint,
    dist / 1000,
    45,
    {units: 'kilometers'},
  )
  const btm = destination(
    origPoint,
    dist / 1000,
    45 - 180,
    {units: 'kilometers'},
  )
  const bbox: BBox = [
    +top.geometry.coordinates[0], +top.geometry.coordinates[1],
    +btm.geometry.coordinates[0], +btm.geometry.coordinates[1],
  ]

  const {features} = randomPoint(1, {bbox})

  return {
    type: 'Point',
    coordinates: roundCoords(
      features[0].geometry.coordinates[0],
      features[0].geometry.coordinates[1],
    ),
  }
}

export function calcDistance(from: Point, to: Point) {
  return distance(from, to, {
    units: 'meters',
  })
}
