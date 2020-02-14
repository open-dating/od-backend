import {ValidationError} from '@nestjs/common'

export function getCustomValidationError(property, message): ValidationError {
  return {
    value: '',
    target: {},
    property,
    constraints: {
      message,
    },
    children: [],
  }
}
