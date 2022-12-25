async function* eventIterator(element, type, options) {
  let done;
  let handler = (event) => done(event);
  let nextEvent = () => new Promise(r => { done = r; });
  element.addEventListener(type, handler, options);
  try {
    while (true) yield nextEvent();
  } finally {
    element.removeEventListener(type, handler, options);
  }
}
