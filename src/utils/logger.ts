import { isTruthy } from '@proscom/ui-utils';
import pino, { MultiStreamRes } from 'pino';
import pretty, { PinoPretty } from 'pino-pretty';
import tee from 'pino-tee';

import { isProduction } from '../config/environment';

function createPinoLoggerErrorStream(): NodeJS.WritableStream {
  const stream = tee(process.stdin);
  stream.tee(process.stderr, (line) => line.level >= 50);
  stream.pipe(process.stdout);
  return stream;
}

/**
 * Создает поток для
 * @returns
 */
function createPinoPrettyStream(): PinoPretty.PrettyStream | undefined {
  return isProduction
    ? undefined
    : pretty({
        colorize: true,
      });
}

export function preparePinoMultistream(): MultiStreamRes {
  const streams = [
    createPinoLoggerErrorStream(),
    createPinoPrettyStream(),
  ].filter(isTruthy);
  return pino.multistream(streams);
}
