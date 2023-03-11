async function dispatcher(signal) {
  let events = eventIterator(window, 'message');
  for await (let event of events) {
    if (signal.aborted) break;
    // Do something with event
  }
}

let abortController = new AbortController();
dispatcher(abortController.signal);
