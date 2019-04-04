/*\
module-type: macro
tags: $:/tags/Macro
title: $:/plugins/bimlas/disqus/macro/comments
type: application/javascript

Display Disqus comments

\*/
(function() {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	var LOADER_ID = "DISQUS-LOADER";
	var THREAD_ID = "disqus_thread";

	exports.name = "disqus-comments";

	exports.params = [
		{"name": "current"},
	];

	/*
	Run the macro
	*/
	exports.run = function(current) {
		// Interactive DOM not available when generating static pages
		if (!$tw.browser) return;

		/* Remove current Disqus */
		var current_disqus = document.getElementById(LOADER_ID);
		if(current_disqus !== null) {
			(document.head || document.body).removeChild(current_disqus);
		}

		window.disqus_config = function() {
			this.page.url = $tw.wiki.getTiddlerText('$:/config/bimlas/disqus/url') + encodeURIComponent(current);
		};

		/* Load Disqus */
		var loader = document.createElement('script');
		loader.src = 'https://' + $tw.wiki.getTiddlerText('$:/config/bimlas/disqus/shortname') + '.disqus.com/embed.js';
		loader.id = LOADER_ID;
		loader.setAttribute('data-timestamp', (new Date()).toString());
		(document.head || document.body).appendChild(loader);

		$tw.utils.nextTick(function() {
			$tw.rootWidget.dispatchEvent({
				type: "disqus-did-insert-element",
				target: document.getElementById(THREAD_ID)
			});
		});

		return '<div id="' + THREAD_ID + '"></div>'
	};

})();
