import Joi = require('joi');
import { extendedJoi } from './extendedJoi';

// type AdvancedObjectSchema<
//   TObject extends Joi.ObjectSchema<Joi.StrictSchemaMap<TObjectType>>,
//   TObjectType
// > = TObjectType extends Date ? TObject | extendedJoi.stringSchema | extendedJoi.dateSchema : TObject;

// type AdvancedSchemaMap<T> = {
//   [P in keyof T]: T[P] extends Array<infer U>
//     ? U[]
//     :
//         | (T[P] extends Joi.ObjectSchema<Joi.StrictSchemaMap<infer ObjectType>>
//             ? AdvancedObjectSchema<T[P], ObjectType>
//             : T[P])
//         | (T[P] extends extendedJoi.stringSchema ? T[P] | Joi.AnySchema : T[P])
//         | Joi.AlternativesSchema;
// };

export const createObjectSchema = <TDataStructure>(
  schemaMap: Joi.StrictSchemaMap<TDataStructure>
): Joi.ObjectSchema<Joi.StrictSchemaMap<TDataStructure>> =>
  extendedJoi.object<TDataStructure, true, TDataStructure>().keys(schemaMap) as Joi.ObjectSchema<
    Joi.StrictSchemaMap<TDataStructure>
  >;
