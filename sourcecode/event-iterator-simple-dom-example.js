import $ from 'https://tritarget.org/cdn/simple-dom.js';

let done = false;
setTimeout(() => (done = true), 10_000);

for await (let event of $.on.click()) {
  if (done) break;
  console.log('Click event from', event.target);
}
