import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppExceptionPayload {
  code?: number;
  message: string;
  details?: unknown;
}

export class AppException extends HttpException {
  constructor(
    payload: AppExceptionPayload,
    status: number = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        code: payload.code ?? status,
        message: payload.message,
        details: payload.details ?? null,
      },
      status,
    );
  }
}
