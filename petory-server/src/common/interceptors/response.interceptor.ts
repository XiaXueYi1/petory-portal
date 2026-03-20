import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import {
  DEFAULT_SUCCESS_CODE,
  DEFAULT_SUCCESS_MESSAGE,
} from '@/common/constants';
import { ApiResponseDto } from '@/common/dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDto<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map(
        (data) =>
          new ApiResponseDto<T>({
            code: DEFAULT_SUCCESS_CODE,
            message: DEFAULT_SUCCESS_MESSAGE,
            data,
          }),
      ),
    );
  }
}
