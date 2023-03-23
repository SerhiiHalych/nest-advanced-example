import Joi = require('joi');
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

interface ExtendedJoiRoot extends Joi.Root {
  arrayOrSingleAsArray(): Joi.ArraySchema;
  e164PhoneNumber(): Joi.StringSchema;
}

const arrayCastJoiExtension: Joi.Extension = {
  type: 'arrayOrSingleAsArray',
  base: Joi.array(),
  coerce(value) {
    const newValue = Array.isArray(value) ? value : [value];

    return {
      value: newValue,
    };
  },
};

const e164PhoneNumberExtension: Joi.Extension = {
  type: 'e164PhoneNumber',
  base: Joi.string(),
  coerce(value, helper) {
    const instance = new PhoneNumberUtil();

    try {
      const phoneNumber = instance.parse(value);

      const ifValidPhoneNumberForRegion = instance.isValidNumber(phoneNumber);

      if (!ifValidPhoneNumberForRegion) {
        return {
          errors: [helper.message({ custom: 'Phone number is invalid' })],
        };
      }

      const formattedPhone = instance.format(phoneNumber, PhoneNumberFormat.E164);

      if (value !== formattedPhone) {
        return {
          errors: [helper.message({ custom: 'Phone number should be valid e164 number' })],
        };
      }

      return {
        value,
      };
    } catch (e) {
      return {
        errors: [helper.message({ custom: 'Phone number is invalid' })],
      };
    }
  },
};

export const extendedJoi: ExtendedJoiRoot = Joi.extend(arrayCastJoiExtension, e164PhoneNumberExtension);
