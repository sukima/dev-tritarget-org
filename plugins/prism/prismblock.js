/*\
title: $:/plugins/sukima/prism/prismblock.js
type: application/javascript
module-type: widget

Wraps up the fenced code blocks parser for Prism and use in TiddlyWiki5

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var TYPE_MAPPINGS_BASE = "$:/config/PrismPlugin/TypeMappings/";

var CodeBlockWidget = require("$:/core/modules/widgets/codeblock.js").codeblock;

var Prism = require("$:/plugins/sukima/prism/prism.js").prism;

Prism.plugins.NormalizeWhitespace.setDefaults({
	'remove-trailing': true,
	'remove-indent': true,
	'left-trim': true,
	'right-trim': true,
	'tabs-to-spaces': 2,
});

CodeBlockWidget.prototype.postRender = function() {
	var domNode = this.domNodes[0],
		language = this.language,
		tiddler = this.wiki.getTiddler(TYPE_MAPPINGS_BASE + language);
	if(tiddler) {
		language = tiddler.fields.text || "";
	}
	if(language && Prism.languages[language.toLowerCase()]) {
		domNode.className = "language-" + language.toLowerCase();
		if($tw.browser && !domNode.isTiddlyWikiFakeDom) {
			Prism.highlightElement(domNode);
		} else {
			var text = domNode.textContent;
			var nw = Prism.plugins.NormalizeWhitespace;
			var grammar = Prism.languages[language.toLowerCase()];
			domNode.children[0].innerHTML = Prism.highlight(nw.normalize(text),grammar,language);
			// If we're using the fakedom then specially save the original raw text
			if(domNode.isTiddlyWikiFakeDom) {
				domNode.children[0].textInnerHTML = text;
			}
		}
	}
};

})();
