let events = eventIterator(document.body, 'input');
for await (let event of events) {
  let { value } = event.target;
  console.log(event.type, value);
  if (value === 'done') break;
}
