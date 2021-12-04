/**
 * Общий интерфейс в которые преобразуются данные различных OAuth провайдеров.
 * За преобразование данных в этот интерфейс отвечает метод validate
 * соответствующей passport-стратегии
 */
export interface OAuthProfile {
  socialId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
}
