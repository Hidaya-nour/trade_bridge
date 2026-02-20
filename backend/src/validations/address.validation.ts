import Joi from 'joi';

export const createAddressSchema = Joi.object({
  region: Joi.string().max(100).required(),
  city: Joi.string().max(100).required(),
  subcity: Joi.string().max(100).optional(),
  latitude: Joi.number().precision(6).optional(),
  longitude: Joi.number().precision(6).optional()
});
