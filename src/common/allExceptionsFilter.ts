import {
  ArgumentsHost,
  Catch,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-express';
import { customAlphabet } from 'nanoid';
import { Logger } from 'nestjs-pino';

import { tryGetJsonError } from '../utils/error';
import { alphabetLowercaseId } from '../utils/string';

const apolloPredefinedExceptions: Record<number, typeof ApolloError> = {
  401: AuthenticationError,
  403: ForbiddenError,
};

/**
 * @see https://github.com/nestjs/graphql/pull/1292
 */
function processApolloError(exception: Error) {
  if (!(exception instanceof HttpException)) return exception;

  const status = exception.getStatus();

  let error: ApolloError;
  if (status in apolloPredefinedExceptions) {
    error = new apolloPredefinedExceptions[status](exception.message);
  } else {
    error = new ApolloError(exception.message, status.toString());
  }

  error.stack = exception.stack;
  error.extensions['exception'] = tryGetJsonError(exception);

  return error;
}

/**
 * Глобальный обработчик ошибок всего приложения.
 * Если в процессе обработки GraphQL или Rest запроса случается исключение,
 * которое доходит до самого верха nestjs, то оно ловится и обрабатывается тут.
 *
 * Всем исключениям присваивается уникальный идентификатор который состоит
 * из набора чисел, задающих количество секунд с даты старта проекта (firstDate),
 * а также четырёх уникальных букв на случай если несколько исключений случатся
 * в одну и ту же секунду.
 *
 * Все исключения логируются вместе с идентификатором, чтобы потом их можно было
 * легко найти в логах.
 *
 * Исключения делятся на два типа - те которые надо показать во фронтенд и те
 * которые во фронтенд показывать нельзя (в дебаг режиме они все-равно показываются).
 * Большинство исключений по умолчанию принадлежат ко второму типу.
 * К первому типу относятся исключения, расширяющие класс HttpException.
 *
 * Первый тип исключений выбрасывается дальше и силами nestjs возвращается во фронтенд.
 * Дополнительно обрабатываются ошибки 401 и 403, чтобы вернуть корректный код ошибки Apollo.
 *
 * Вместо второго типа исключений в nestjs передаётся InternalServerError,
 * который возвращается на фронтенд без какой-либо информации, чтобы не нанести
 * ущерба серверу.
 */
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  firstDate = new Date(2021, 0, 1, 0, 0, 0, 0).getTime();
  generateErrorRandomCode = customAlphabet(alphabetLowercaseId, 4);

  constructor(private readonly logger: Logger) {
    super();
  }

  generateErrorId() {
    const baseSeconds = Math.floor((Date.now() - this.firstDate) / 1000);
    const errorTime = baseSeconds + '';
    const matches = errorTime.match(/.{1,3}(?=(.{3})*$)/g);
    return matches?.join('-') + '-' + this.generateErrorRandomCode();
  }

  catch(exception: any, host: ArgumentsHost) {
    const isExpected = exception instanceof HttpException;
    const log = (message) =>
      isExpected ? this.logger.log(message) : this.logger.error(message);
    const errorId = this.generateErrorId();

    if (typeof exception.stack !== 'undefined') {
      log({
        errorId,
        error: exception.message,
        stack: exception.stack,
        exception,
      });
    } else {
      log({ errorId, error: exception.message, exception });
    }

    // может быть полезно если БД предоставляется заказчиком
    // const isDbConnectionError =
    //   exception.code === 'ENETUNREACH' &&
    //   exception.address === typeormHost &&
    //   exception.port === typeormPort;

    const isPayloadTooLargeError =
      exception.statusCode === 413 && exception.name === 'PayloadTooLargeError';

    let error;

    if (isExpected) {
      error = exception;
      if (error.message && typeof error.message === 'object') {
        error.message.errorId = errorId;
      } else {
        error.errorId = errorId;
      }
    } else if (isPayloadTooLargeError) {
      error = new HttpException(`Payload Too Large Error #${errorId}`, 413);
      error.errorId = errorId;
      // может быть полезно если БД предоставляется заказчиком
      // } else if (isDbConnectionError) {
      //   error = new HttpException(`Database Connection Error #${errorId}`, 503);
      //   error.errorId = errorId;
    } else {
      error = new InternalServerErrorException(
        `Internal Server Error #${errorId}`,
      );
      error.errorId = errorId;
    }

    if (GqlArgumentsHost.create(host).getType<GqlContextType>() === 'graphql') {
      return processApolloError(error);
    } else {
      return super.catch(error, host);
    }
  }
}
