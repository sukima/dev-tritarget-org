/*\
title: $:/plugins/tiddlywiki/highlight/htmlbarsparser.js
type: application/javascript
module-type: parser

Add support for text/x-handlebars rendering

\*/
(function() {

"use strict";

var TextParser = require('$:/core/modules/parsers/textparser')['text/plain'];

exports['text/x-htmlbars'] = TextParser;

})();
