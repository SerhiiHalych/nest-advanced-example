import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import type { Observable } from 'rxjs';

import type { RequestExtended } from '../RequestExtended';

@Injectable()
export class StringSanitizerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log(123)

    return next.handle();
  }
}

const sanitize = (value: any): any => {
  if (_.isString(value)) {
    const trimmedString = _.trim(value);

    return trimmedString === '' ? null : trimmedString;
  }

  if (_.isArray(value)) {
    return _.map(value, sanitize);
  }

  if (_.isPlainObject(value)) {
    return _.mapValues(value, sanitize);
  }

  return value;
};
