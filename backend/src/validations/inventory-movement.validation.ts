import Joi from 'joi';

export const createMovementSchema = Joi.object({
  product_id: Joi.string().uuid().required().messages({
    'string.uuid': 'Product ID must be a valid UUID',
    'any.required': 'Product ID is required'
  }),
  movement_type: Joi.string().valid('in', 'out', 'adjustment').required().messages({
    'any.only': 'Movement type must be one of: in, out, adjustment',
    'any.required': 'Movement type is required'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'number.integer': 'Quantity must be an integer',
    'any.required': 'Quantity is required'
  }),
  reason: Joi.string().max(500).optional().messages({
    'string.max': 'Reason cannot exceed 500 characters'
  })
});

export const movementIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'Movement ID must be a valid UUID',
    'any.required': 'Movement ID is required'
  })
});

export const productIdSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'string.uuid': 'Product ID must be a valid UUID',
    'any.required': 'Product ID is required'
  })
});