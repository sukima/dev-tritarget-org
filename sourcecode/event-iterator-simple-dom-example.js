import $ from 'https://tritarget.org/cdn/simple-dom.js';

async function listenForClicks() {
  for await (let event of $.on.click()) {
    console.log('Click event from', event.target);
  }
}

listenForClicks();
