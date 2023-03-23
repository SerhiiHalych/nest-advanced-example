import type { CallHandler, ExecutionContext, NestInterceptor, Type } from '@nestjs/common';
import { Injectable, mixin } from '@nestjs/common';
import type { Request } from 'express';
import type { ObjectSchema, ValidationErrorItem } from 'joi';
import type { Observable } from 'rxjs';

import { ValidationException } from './ValidationException';

export const validateRequest = (schema: ObjectSchema): Type<NestInterceptor> => {
  @Injectable()
  class RequestValidationInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest<Request>();

      try {
        const modifiedRequest: Request = await schema.validateAsync(request, {
          abortEarly: false,
          allowUnknown: true,
          presence: 'required',
          skipFunctions: true,
          errors: {
            label: 'key',
            wrap: {
              label: false,
            },
          },
        });

        // Override request with modified result after validation
        request.query = modifiedRequest.query;
        request.body = modifiedRequest.body;

        return next.handle();
      } catch (error) {
        if (error.name === 'ValidationError' && error.isJoi) {
          const {
            details,
          }: {
            details: ValidationErrorItem[];
          } = error;

          throw new ValidationException(
            details.map(({ message, path }) => ({
              field: path.slice(1).join('.'),
              message,
            }))
          );
        }

        throw error;
      }
    }
  }

  return mixin(RequestValidationInterceptor);
};
