import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  DEFAULT_SUCCESS_CODE,
  DEFAULT_SUCCESS_MESSAGE,
  HTTP_ERROR_CODE,
} from '../constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message =
        this.getMessage(exception.getResponse()) ?? exception.message;

      response.status(status).json({
        code: status,
        message,
        data: null,
        timestamp: Date.now(),
      });
      return;
    }

    this.logger.error(
      'Unhandled exception',
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: HTTP_ERROR_CODE.INTERNAL_SERVER_ERROR ?? DEFAULT_SUCCESS_CODE,
      message: DEFAULT_SUCCESS_MESSAGE,
      data: null,
      timestamp: Date.now(),
    });
  }

  private getMessage(response: string | object): string | undefined {
    if (typeof response === 'string') {
      return response;
    }

    if (!('message' in response)) {
      return undefined;
    }

    const message = response.message;
    if (typeof message === 'string') {
      return message;
    }

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    return undefined;
  }
}
