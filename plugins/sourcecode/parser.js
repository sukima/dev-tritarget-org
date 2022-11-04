/*\
title: $:/plugins/sukima/sourcecode/parser.js
type: application/javascript
module-type: parser

A text/prs.sourcecode parser

\*/
exports['text/prs.sourcecode'] = function SourceCodeParser(type, text, options) {
  this.tree = [{ type: 'raw', html: text }];
};
