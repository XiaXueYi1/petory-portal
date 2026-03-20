import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class NormalizeStringPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    void metadata;
    if (typeof value !== 'string') {
      return value;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }
}
