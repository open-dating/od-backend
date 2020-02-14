import {Point} from '@turf/turf'

import {depersonalizePoint} from './geo'

describe('geo', () => {
  it('depersonalizePoint', () => {
    const inp: Point = {
      type: 'Point',
      coordinates: [22.22, 33.45],
    }
    const out = depersonalizePoint(inp)

    expect(out.coordinates[0] !== inp.coordinates[0]).toBeTruthy()
    expect(Math.abs(out.coordinates[0] - inp.coordinates[0]) < 0.5).toBeTruthy()

    expect(out.coordinates[1] !== inp.coordinates[1]).toBeTruthy()
    expect(Math.abs(out.coordinates[1] - inp.coordinates[1]) < 0.5).toBeTruthy()
  })
})
