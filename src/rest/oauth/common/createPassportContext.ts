import { Request, Response } from 'express';
import passport, { AuthenticateOptions } from 'passport';

/**
 * Оборачивает вызов метода passport.authenticate в асинхронную функцию,
 * возвращающую промис
 *
 * @param request - контекст запроса express
 * @param response - контекст ответа express
 */
export function createPassportContext(request: Request, response: Response) {
  return (
    type: string,
    options: AuthenticateOptions,
    callback: (...args: any[]) => any,
  ) => {
    return new Promise((resolve, reject) => {
      const authn = passport.authenticate(type, options, (err, user, info) => {
        try {
          request.authInfo = info;
          return resolve(callback(err, user, info));
        } catch (err) {
          reject(err);
        }
      });
      return authn(request, response, (err) => {
        if (err) {
          reject(err);
        }
      });
    });
  };
}
