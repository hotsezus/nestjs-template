import {
  OneTimeTokenPayload,
  OneTimeTokenTypeEnum,
} from '../../ott/common/oneTimeToken.service';

export interface OneTimeTokenOAuthFlow extends OneTimeTokenPayload {
  type: typeof OneTimeTokenTypeEnum.OAUTH_FLOW;
  userId?: number;
  origin?: string;
  state?: string;
}
