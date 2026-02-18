import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/errors';
import { ValidationChain, validationResult } from 'express-validator';

type SchemaOrChains = Joi.ObjectSchema | ValidationChain[];

export const validate = (schema: SchemaOrChains) => {
  // If schema is an array, assume express-validator chains
  if (Array.isArray(schema)) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      await Promise.all((schema as ValidationChain[]).map(chain => chain.run(req)));
      const result = validationResult(req);
      if (!result.isEmpty()) {
        const errors = result.array().map(err => ({ field: (err as any).param || (err as any).path || '', message: err.msg }));
        next(new ValidationError(errors));
        return;
      }
      next();
    };
  }

  // Otherwise treat as Joi schema
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = (schema as Joi.ObjectSchema).validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      next(new ValidationError(errors));
      return;
    }

    next();
  };
};