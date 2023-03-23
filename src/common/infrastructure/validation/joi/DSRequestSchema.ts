import Joi = require('joi');

export interface DSRequestSchema<
  TParamsSchema extends Joi.ObjectSchema = Joi.ObjectSchema<any>,
  TQuerySchema extends Joi.ObjectSchema = Joi.ObjectSchema<any>,
  TBodySchema extends Joi.ObjectSchema = Joi.ObjectSchema<any>
> {
  params?: TParamsSchema;
  query?: TQuerySchema;
  body?: TBodySchema;
}
