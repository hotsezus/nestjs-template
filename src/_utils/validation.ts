import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { isNil } from '@nestjs/common/utils/shared.utils';

export function ensureNotNil(value: any, message = '') {
  if (isNil(value)) {
    throw new NotFoundException(message);
  }
}

export function ensureIsArray(
  value: any,
  message: string = 'Expected array',
): value is any[] {
  if (!Array.isArray(value)) {
    throw new UnprocessableEntityException(message);
  }
  return true;
}
