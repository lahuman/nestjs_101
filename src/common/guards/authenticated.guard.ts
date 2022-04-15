import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log("***********************************")
    console.log(request.headers.get("Authorization"));
    console.log("***********************************")
    return request.user;
  }
}
