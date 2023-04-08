async function once(element, eventName) {
  let events = eventIterator(element, eventName);
  for await (let event of events) return event;
}

let event = await once(document.body, 'input');
console.log(event.type, event.target.value);
