import type { CallHandler, ExecutionContext, NestInterceptor, Type } from '@nestjs/common';
import { Injectable, mixin } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { ObjectSchema, ValidationErrorItem } from 'joi';
import type { Observable } from 'rxjs';

import { WsValidationException } from './WsValidationException';

export const validateWSMessage = (schema: ObjectSchema): Type<NestInterceptor> => {
  @Injectable()
  class WSMessageValidationInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const data = context.switchToWs().getData();

      try {
        await schema.validateAsync(data, {
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

        return next.handle();
      } catch (error) {
        if (error.name === 'ValidationError' && error.isJoi) {
          const {
            details,
          }: {
            details: ValidationErrorItem[];
          } = error;

          throw new WsValidationException(
            details.map(({ message, path }) => ({
              field: path.slice(1).join('.'),
              message,
            }))
          );
        }

        throw new WsException(error);
      }
    }
  }

  return mixin(WSMessageValidationInterceptor);
};
