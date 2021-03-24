const validatables = new WeakSet();

function validateElement(element) {
  if (!validatables.has(element)) { return; }
  return new Promise(resolve => {
    let handler = () => {
      element.removeEventListener('validated', handler);
      resolve();
    };
    element.addEventListener('validated', handler);
    element.dispatchEvent(new CustomEvent('validate'));
  });
}

export function validate(...elements) {
  return Promise.all(elements.map(validateElement));
}

export function setValidity(
  element,
  validator = (() => []),
  { on = 'change,input,blur' } = {}
) {
  let isCalculating = false;
  let eventNames = ['validate', ...on.split(',')];
  let handler = async (event) => {
    if (isCalculating) { return; }
    isCalculating = true;
    let [error = ''] = await validator(element, event);
    element.checkValidity();
    element.setCustomValidity(error);
    element.dispatchEvent(new CustomEvent('validated', { bubbles: true }));
    isCalculating = false;
  };
  validatables.add(element);
  eventNames.forEach(evt => element.addEventListener(evt, handler));
  return () => {
    eventNames.forEach(evt => element.removeEventListener(evt, handler));
  };
}
