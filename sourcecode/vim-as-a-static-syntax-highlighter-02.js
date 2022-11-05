/*\
title: $:/plugins/sukima/sourcecode/parser.js
type: application/javascript
module-type: parser
\*/
function SourceCodeParser(type, text, options) {
  this.tree = [{ type: 'raw', html: text }];
};
exports['text/prs.sourcecode'] = SourceCodeParser;
