import Joi = require('joi');
import type { DSRequestSchema } from './DSRequestSchema';
import { extendedJoi } from './extendedJoi';

export const createRequestSchema = <TSchema extends DSRequestSchema>(schema: TSchema): Joi.ObjectSchema<TSchema> => {
  const { body, params, query } = schema;

  const joiSchema: Joi.PartialSchemaMap<TSchema> = {};

  if (body) {
    joiSchema.body = body.options({
      allowUnknown: false,
    });
  }

  if (params) {
    joiSchema.params = params.options({
      allowUnknown: false,
    });
  }

  if (query) {
    joiSchema.query = query.options({
      allowUnknown: false,
    });
  }

  return extendedJoi.object<TSchema, true, TSchema>().keys(joiSchema);
};
