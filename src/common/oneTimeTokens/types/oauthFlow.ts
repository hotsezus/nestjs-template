import {
  OneTimeTokenPayload,
  OneTimeTokenTypeEnum,
} from '../oneTimeToken.service';

export interface OneTimeTokenOAuthFlow extends OneTimeTokenPayload {
  type: typeof OneTimeTokenTypeEnum.OAUTH_FLOW;
  userId?: number;
  origin?: string;
  state?: string;
}
