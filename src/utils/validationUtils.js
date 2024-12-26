const formatJoiErrors = function (error) {
  if (!error || !error.details) return [];

  const groupedErrors = error.details.reduce((acc, err) => {
    const field = err.context.key;

    if (!acc[field]) {
      acc[field] = [];
    }

    if (err.context.details) {
      acc[field].push(...err.context.details);
    } else {
      acc[field].push(err.message);
    }

    return acc;
  }, {});

  return Object.entries(groupedErrors).map(([field, messages]) => {
    return messages.length === 1
      ? { field, message: messages[0] }
      : { field, messages };
  });
};

const joiPasswordValidation = function (value, helpers) {
  const errors = [];

  if (value.length < 12)
    errors.push('A senha deve ter pelo menos 12 caracteres.');
  if (value.length > 64) errors.push('A senha não deve exceder 64 caracteres.');

  if (!/[a-z]/.test(value))
    errors.push('A senha deve conter pelo menos uma letra minúscula.');

  if (!/[A-Z]/.test(value))
    errors.push('A senha deve conter pelo menos uma letra maiúscula.');

  if (!/\d/.test(value))
    errors.push('A senha deve conter pelo menos um número.');

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
    errors.push('A senha deve conter pelo menos um caractere especial.');

  if (errors.length > 0) {
    return helpers.error('any.custom', { details: errors });
  }

  return value;
};

module.exports = { formatJoiErrors, joiPasswordValidation };
