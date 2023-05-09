function eventIterator(element, type, options) {
  let controller = new AbortController();
  let { signal } = controller;

  async function* events() {
    let done, abort;
    let handler = (event) => done(event);
    let nextEvent = () =>
      new Promise((a, b) => { done = a; abort = b; });

    signal.addEventListener('abort', () => abort());
    element.addEventListener(type, handler, options);

    try {
      while (!signal.aborted) yield nextEvent();
    } catch (ignored) {
      // The only way this happens is if abort was called
    } finally {
      element.removeEventListener(type, handler, options);
    }
  }

  return {
    events,
    [Symbol.asyncIterator]: events,
    abort: () => controller.abort(),
  };
}
