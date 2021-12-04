import {
  OneTimeTokenPayload,
  OneTimeTokenTypeEnum,
} from '../../ott/common/oneTimeToken.service';

export interface OneTimeTokenOAuthStart extends OneTimeTokenPayload {
  type: typeof OneTimeTokenTypeEnum.OAUTH_START;
  userId?: number;
}
