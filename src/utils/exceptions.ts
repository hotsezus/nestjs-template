import { UnprocessableEntityException } from '@nestjs/common';

export const exceptionDuplicateKey = (e) => {
  const match =
    e.name === 'QueryFailedError' &&
    e.detail.match(/Key \((\w+)\)=\(.+?\) already exists./);
  if (match) {
    const field = match[1];
    throw new UnprocessableEntityException(`${field} already taken`);
  }
};

export const exceptionRelationNotFound = (e) => {
  const match =
    e.name === 'QueryFailedError' &&
    e.detail.match(/Key \((\w+)\)=\(.+?\) is not present in table "(\w+)"./);
  if (match) {
    const field = match[1];
    const table = match[2];
    throw new UnprocessableEntityException(
      `${field} FOREIGN KEY not present in ${table}`,
    );
  }
};
