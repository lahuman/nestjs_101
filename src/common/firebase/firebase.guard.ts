import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class FirebaseGuard implements CanActivate {
  logger: Logger = new Logger(FirebaseGuard.name);

  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const ftoken = req.headers.authorization
      ? req.headers.authorization.split('Bearer ')[1]
      : '';

    if (ftoken === undefined) {
      throw new HttpException(
        { status: HttpStatus.UNAUTHORIZED, error: 'Token Is Not Found.' },
        HttpStatus.UNAUTHORIZED
      );
    }

    req.user = await this.firebaseService.authTokenVerify(ftoken);
    const user = req.user;
    if (!user) {
      return false;
    }

    this.logger.debug('FirebaseGuard ok ::');
    return true;
  }
}
