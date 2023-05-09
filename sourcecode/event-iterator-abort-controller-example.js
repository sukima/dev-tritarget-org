async function dispatcher(signal) {
  let events = eventIterator(window, 'message');
  signal.addEventListener('abort', events.abort);
  for await (let event of events) {
    // Do something with event
  }
  signal.removeEventListener('abort', events.abort);
}

let abortController = new AbortController();
dispatcher(abortController.signal);
