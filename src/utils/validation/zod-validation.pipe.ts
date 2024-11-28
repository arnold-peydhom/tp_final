import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';
import { fromError } from 'zod-validation-error';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    let parsedValue;

    try {
      parsedValue = this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException(fromError(error).toString());
    }

    return parsedValue;
  }
}
