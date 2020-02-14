import {hasPhoneNumber} from './detectors'

describe('detectors', () => {
  it('find phone in message', () => {
    expect(hasPhoneNumber('My phone is +7 900 667 99 58')).toBeTruthy()
    expect(hasPhoneNumber('Call: (213) 373-42-53 ext. 1234.')).toBeTruthy()

    expect(hasPhoneNumber('I live at 24 street')).toBeFalsy()
  })
})
