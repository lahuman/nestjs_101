import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import {
  CustomHttpExecptionResponse,
  HttpExceptionResponse,
} from './http-exception-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  logger: Logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorMessage: string;
    let badReqResponse: object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const excRes = exception.getResponse();
      const excError = (excRes as HttpExceptionResponse).error;
      errorMessage = excError || exception.message;
      if (excError == 'Bad Request') {
        // badReqResponse = Object.assign({}, excRes);
        badReqResponse = Object.assign({}, excRes as object);
      }
    } else if (
      exception instanceof UnauthorizedException ||
      exception instanceof ForbiddenException
    ) {
      response.status(403).send({
        statusCode: 403,
        message: 'forbidden',
      })
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      errorMessage = exception.message;
    } else if (exception instanceof QueryFailedError && exception['code'] === 'ER_DUP_ENTRY') {
      status = HttpStatus.BAD_REQUEST;
      errorMessage = 'Already Exist Data!';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = 'Critical internal server error occured!';
    }

    const clientIp = request.headers['x-forwarded-for'];
    this.logger.error({ message: exception['message'], stack: exception['stack'], clientIp });

    const errorResponse = this.getErrorResponse(status, errorMessage, request, badReqResponse);
    const errorLog: string = this.getErrorLog(
      errorResponse,
      request,
      exception,
    );
    this.writeErrorLogToFile(errorLog);
    response.status(status).json(errorResponse);
  }

  private getErrorResponse = (
    status: HttpStatus,
    errorMessage: string,
    request: Request,
    badReqResponse: object
  ): CustomHttpExecptionResponse => ({
    statusCode: status,
    error: errorMessage,
    path: request.url,
    method: request.method,
    timeStamp: new Date(),
    request: badReqResponse
  });

  private getErrorLog = (
    errorResponse: CustomHttpExecptionResponse,
    request: Request,
    exception: unknown,
  ): string => {
    const { statusCode, error } = errorResponse;
    const { method, url, headers } = request;

    const errorLog = `Response Code: ${statusCode}, Method: ${method}, URL: ${url}, IP: ${headers['X-Real-IP']}
${JSON.stringify(errorResponse)}
User : ${JSON.stringify(request['user'] ?? 'Not signed in')}
Body : ${JSON.stringify(request.body)}
Query : ${JSON.stringify(request.query)}
${exception instanceof HttpException ? exception.stack : error}\n\n`;

    return errorLog;
  };

  private writeErrorLogToFile = (errorLog: string): void => {
    this.logger.error(errorLog);
  };
}
