
/*\
title: $:/plugins/sukima/babel-polyfill/plugin.js
type: application/javascript
module-type: startup

ES2015 Polyfill import

\*/

export function startup() {
  $tw.modules.execute('$:/plugins/sukima/babel-polyfill/babel-polyfill.js');
}
