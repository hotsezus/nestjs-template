import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AllExceptionsFilter } from './allExceptionsFilter';

@Module({
  providers: [
    AllExceptionsFilter,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [AllExceptionsFilter],
})
export class ExceptionsModule {}
