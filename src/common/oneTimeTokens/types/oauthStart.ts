import {
  OneTimeTokenPayload,
  OneTimeTokenTypeEnum,
} from '../oneTimeToken.service';

export interface OneTimeTokenOAuthStart extends OneTimeTokenPayload {
  type: typeof OneTimeTokenTypeEnum.OAUTH_START;
  userId?: number;
}
