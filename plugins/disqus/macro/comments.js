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

	exports.name = "disqus-comments";

	exports.params = [
		{"name": "current"},
	];

	/*
	Run the macro
	*/
	exports.run = function(current) {

		/* Remove current Disqus */
		var current_disqus = document.getElementById("DISQUS-LOADER");
		if(current_disqus !== null) {
			(document.head || document.body).removeChild(current_disqus);
		}

		window.disqus_config = function() {
			this.page.url = $tw.wiki.getTiddlerText('$:/config/bimlas/disqus/url') + encodeURIComponent(current);
		};

		/* Load Disqus */
		var loader = document.createElement('script');
		loader.src = 'https://' + $tw.wiki.getTiddlerText('$:/config/bimlas/disqus/shortname') + '.disqus.com/embed.js';
		loader.id = 'DISQUS-LOADER';
		loader.setAttribute('data-timestamp', (new Date()).toString());
		(document.head || document.body).appendChild(loader);

		return '<div id="disqus_thread"></div>'
	};

})();
