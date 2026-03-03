import Joi from 'joi';

/**
 * Middleware factory that validates req.body against a Joi schema.
 * It responds with HTTP 400 if validation fails.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: details
      });
    }

    req.body = value;
    next();
  };
}

