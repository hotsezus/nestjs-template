import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { STRATEGY_JWT } from '../common/jwtStrategy.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard(STRATEGY_JWT) {}
