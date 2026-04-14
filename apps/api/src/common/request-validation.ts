import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

const mapValidationErrors = (errors: ValidationError[]) =>
  errors.map((error) => ({
    field: error.property,
    constraints: error.constraints ?? {},
  }));

export const createRequestValidationPipe = () =>
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) =>
      new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        statusCode: 400,
        details: mapValidationErrors(errors),
      }),
  });
