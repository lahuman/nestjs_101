import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  generateKey(context, prefix) {
    const suffix = `${context.getClass().name}-${context.getHandler().name}`;
    return `throttle:${suffix}:${prefix}`;
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // user 정보가 있을 경우 id 기반으로 적제 처리 없을 경우 ip 사용
    return req.user ? req.user.id : req.ips.length ? req.ips[0] : req.ip;
  }
}
