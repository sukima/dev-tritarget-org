
/*\
title: $:/plugins/sukima/jsbin/startup.js
type: application/javascript
module-type: startup

Embed a JS Bin

\*/

export function startup() {
  if (!$tw.browser) { return; }
  const jsbin = document.createElement('script');
  jsbin.src = '//static.jsbin.com/js/embed.min.js?3.35.11';
  document.getElementsByTagName('body')[0].appendChild(jsbin);
}
