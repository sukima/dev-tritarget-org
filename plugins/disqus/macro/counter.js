/*\
module-type: macro
tags: $:/tags/Macro
title: $:/plugins/bimlas/disqus/macro/counter
type: application/javascript

Display Disqus comments counter

\*/
(function() {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	exports.name = "disqus-counter";

	exports.params = [
		{"name": "current"},
	];

	/*
	Run the macro
	*/
	exports.run = function(current) {

		/* Get counter loader */
		if(document.getElementById("dsq-count-scr") === null) {
			var loader = document.createElement('script');
			loader.src = 'https://' + $tw.wiki.getTiddlerText('$:/config/bimlas/disqus/shortname') + '.disqus.com/count.js';
			loader.id = 'dsq-count-scr';
			loader.setAttribute('async','');
			document.head.appendChild(loader);
		}

		/* Update newly added counters */
		$tw.hooks.addHook("th-page-refreshed", function() {
			if (window.DISQUSWIDGETS) {
				window.DISQUSWIDGETS.getCount({reset: true});
			}
		});

		return '(<span class="disqus-comment-count" data-disqus-url="' + $tw.wiki.getTiddlerText('$:/config/bimlas/disqus/url') + encodeURIComponent(current) + '">' + $tw.wiki.getTiddlerText('$:/config/bimlas/disqus/counter-default') + '</span>)';
	};

})();
