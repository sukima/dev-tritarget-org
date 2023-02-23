
/*\
title: $:/plugins/sukima/obfuscate/utils.js
type: application/javascript
module-type: utils

A text/prs.obfuscated creator utility

\*/
const OBFUSCATE_SECRET = 'Stzla#tiAMcmD3ga6zEGwZIWwaRO&%W626c9wRBorC82!x38dhAU#iUSQ2$trI6gJW7iPC%bcGyfZGB6kM96pLEQ9h^zgne^pGS0rj*T$N0nEdxSc!zcg1JO#igr89JB';

$tw.utils.obfuscate = function(text) {
  return $tw.crypto.encrypt(text, OBFUSCATE_SECRET);
};

$tw.utils.deobfuscate = function(text) {
  return $tw.crypto.decrypt(text, OBFUSCATE_SECRET);
};
