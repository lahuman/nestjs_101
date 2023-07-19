import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';

export const FirebaseUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const logger: Logger = new Logger(FirebaseUser.name);
    const req: { user: unknown } = context.switchToHttp().getRequest();
    logger.debug('FirebaseUser ok ::');
    return req.user;
  }
);
