import { isTruthy } from '@proscom/ui-utils';
import pino, { MultiStreamRes } from 'pino';
import pretty, { PinoPretty } from 'pino-pretty';
import tee from 'pino-tee';

import { isProduction } from '../config/environment';

const isErrorLog = (line: any) => line.level >= 50;

const isNonErrorLog = (line: any) => line.level < 50;

function createPinoFilteredStream(
  filter: (line: any) => boolean,
  target: NodeJS.WritableStream,
): NodeJS.WritableStream {
  const stream = tee(process.stdin);
  stream.tee(target, filter);
  return stream;
}

function createPinoMainStream():
  | PinoPretty.PrettyStream
  | NodeJS.WritableStream
  | undefined {
  return isProduction
    ? createPinoFilteredStream(isNonErrorLog, process.stdout)
    : pretty({
        colorize: true,
      });
}

export function preparePinoMultistream(): MultiStreamRes {
  const streams = [
    createPinoFilteredStream(isErrorLog, process.stderr),
    createPinoMainStream(),
  ].filter(isTruthy);
  return pino.multistream(streams);
}
