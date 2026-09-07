const { ValidationError } = require('../utils/customErrors');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    if (!schema) return next();

    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: ''
        }
      }
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(new ValidationError('Input validation failed', details));
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
