class ListStore {
  #store = new WeakMap();
  get(key) {
    return this.#store.get(key) ?? new Set();
  }
  set(key, list) {
    return this.#store.set(key, list);
  }
  has(key, item) {
    return this.get(key).has(item);
  }
  delete(key, item) {
    return this.get(key).delete(item);
  }
  concat(key, list) {
    return new Set([...this.get(key), ...list]);
  }
  append(key, list) {
    return this.set(key, this.concat(key, list));
  }
  remove(key, items) {
    for (let item of items) {
      this.delete(key, item);
    }
  }
}

class EventsManager {
  #store;
  #element;
  #listeners = new Map();
  constructor(element, store) {
    this.#store = store;
    this.#element = element;
  }
  add(name, handler) {
    if (this.#store.has(this.#element, name)) { return; }
    this.#store.append(this.#element, [name]);
    this.#element.addEventListener(name, handler);
    this.#listeners.set(name, handler);
  }
  has(name) {
    return this.#listeners.has(name);
  }
  removeAll() {
    for (let [name, handler] of this.#listeners) {
      this.#store.delete(this.#element, name);
      this.#element.removeEventListener(name, handler);
    }
  }
}

async function reduceValidators(validators, ...args) {
  let promises = Array.from(validators, validator => validator(...args));
  let errors = await Promise.all(promises);
  return Array.from(new Set(errors.reduce((a, b) => [...a, ...b], [])));
}

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

const eventsStore = new ListStore();
const validatorsStore = new ListStore();
const noop = () => {};
const rethrow = (error) => { throw error; };

export function validate(...elements) {
  return Promise.all(elements.map(validateElement));
}

export function setValidity(
  element,
  validators = [],
  { on = 'change,input,blur' } = {}
) {
  let taskCount = 0;
  let lastTask = Promise.resolve();
  let eventNames = on.split(',');
  let eventsManager = new EventsManager(element, eventsStore);

  const updateValidity = ({ target }) => {
    taskCount++;
    lastTask = lastTask.then(async () => {
      taskCount--;
      if (taskCount !== 0) { return; }
      let errors = await reduceValidators(validatorsStore.get(element), target);
      target.checkValidity();
      target.setCustomValidity(errors[0] ?? '');
      target.dispatchEvent(
        new CustomEvent('validated', { bubbles: true, detail: { errors } })
      );
    });
    return lastTask;
  };

  const validateHandler = (event) => {
    let { resolve = noop, reject = rethrow } = event.detail ?? {};
    event.preventDefault();
    event.stopPropagation();
    updateValidity(event).then(resolve, reject);
  };

  validators = Array.isArray(validators) ? validators : [validators];
  validatorsStore.append(element, validators);

  eventsManager.add('validate', validateHandler);
  eventNames.forEach(evt => eventsManager.add(evt, updateValidity));

  return () => {
    eventsManager.removeAll();
    validatorsStore.remove(element, validators);
  };
}
