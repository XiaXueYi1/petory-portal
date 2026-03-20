export class ApiResponseDto<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: number;

  constructor(partial: Partial<ApiResponseDto<T>> = {}) {
    this.code = partial.code ?? 0;
    this.message = partial.message ?? 'OK';
    this.data = (partial.data ?? null) as T;
    this.timestamp = partial.timestamp ?? Date.now();
  }
}
