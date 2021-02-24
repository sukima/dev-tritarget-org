export function validate(...elements) {
  let validateEvent = new CustomEvent('validate');
  elements.forEach(element => element.dispatchEvent(validateEvent));
}

export function setValidity(
  element,
  validator = (() => []),
  { on = 'change,input,blur' } = {}
) {
  let eventNames = ['validate', ...on.split(',')];
  let handler = () => {
    let [error = ''] = validator(element);
    element.setCustomValidity(error);
    element.dispatchEvent(new CustomEvent('validated'), { bubbles: true });
  };
  eventNames.forEach(evt => element.addEventListener(evt, handler));
  return () => {
    eventNames.forEach(evt => element.removeEventListener(evt, handler));
  };
}
