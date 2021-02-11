import { isNil } from '@nestjs/common/utils/shared.utils';

export function applyDefaults<T>(target: T, defaults: Partial<T>): void {
  for (const key of Object.keys(defaults)) {
    if (isNil(target[key])) {
      target[key] = defaults[key];
    }
  }
}

export function applyChanges<T>(target: T, changes: Partial<T>): void {
  for (const field of Object.keys(changes)) {
    target[field] = changes[field];
  }
}

export function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result = { ...obj };
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined) {
      delete result[key];
    }
  }
  return result;
}
