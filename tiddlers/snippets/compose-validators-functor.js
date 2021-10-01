function composeValidators(...validators) {
  return function composedValidator(element) {
    return validators.reduce(
      (acc, validator) => [...acc, ...validator(element)],
      []
    );
  };
}
