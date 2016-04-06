
/*\
title: $:/plugins/sukima/obfuscate/utils.js
type: application/javascript
module-type: utils

A text/prs.obfuscated creator utility

\*/
const OBFUSCATE_SALT = 'DN-2I4,zYX:<9A2nGK4&yTzfG;C7drODToNgr/WrSe<zNuG[+#yL@^*-Th(Y{]y';

$tw.utils.obfuscate = function(text) {
  return sjcl.encrypt(OBFUSCATE_SALT, text);
};

$tw.utils.deobfuscate = function(text) {
  return sjcl.decrypt(OBFUSCATE_SALT, text);
};
