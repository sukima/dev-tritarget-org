const validatables = new WeakSet();
const doNothing = () => {};
const rethrow = (error) => { throw error; };

function validateElement(element) {
  return new Promise((resolve, reject) => {
    let event = new CustomEvent('validate', {
      bubbles: true,
      cancelable: true,
      detail: { resolve, reject }
    });
    let wasNotPrevented = element.dispatchEvent(event);
    if (wasNotPrevented) { resolve(); }
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
  if (validatables.has(element)) {
    throw new Error('An element can only have one validator registered on it');
  }
  let taskCount = 0;
  let lastTask = Promise.resolve();
  let eventNames = on.split(',');
  let updateValidity = ({ target }) => {
    taskCount++;
    lastTask = lastTask.then(async () => {
      taskCount--;
      if (taskCount !== 0) { return; }
      let [error = ''] = await validator(target);
      target.checkValidity();
      target.setCustomValidity(error);
      target.dispatchEvent(new CustomEvent('validated', { bubbles: true }));
    });
    return lastTask;
  };
  let validateHandler = (event) => {
    let { resolve = doNothing, reject = rethrow } = event.detail ?? {};
    event.preventDefault();
    event.stopPropagation();
    updateValidity(event).then(resolve, reject);
  };
  validatables.add(element);
  element.addEventListener('validate', validateHandler);
  eventNames.forEach(evt => element.addEventListener(evt, updateValidity));
  return () => {
    validatables.delete(element);
    element.removeEventListener('validate', validateHandler);
    eventNames.forEach(evt => element.removeEventListener(evt, updateValidity));
  };
}
