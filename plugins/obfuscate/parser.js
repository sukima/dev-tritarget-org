
/*\
title: $:/plugins/sukima/obfuscate/parser.js
type: application/javascript
module-type: parser

A text/prs.obfuscated parser

\*/
exports['text/prs.obfuscated'] = function ObfuscateParser(type, text, options) {
  if ($tw.browser) {
    this.tree = [{
      type: 'raw',
      html: $tw.utils.deobfuscate(text)
    }];
  } else {
    this.tree = [{
      type: 'text',
      text: 'This page has obfuscated content to protect from site scrappers. It can only be viewed in the JavaScript version.'
    }];
  }
};
