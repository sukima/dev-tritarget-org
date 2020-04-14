/*\
title: $:/plugins/bimlas/disqus/viewtoolbar/disqus-open-listener.js
type: application/javascript
module-type: startup

Add event listener for Disqus toolbar button

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "open-disqus";
exports.synchronous = true;

exports.startup = function() {
	$tw.rootWidget.addEventListener("disqus-did-insert-element", function(event) {
		$tw.pageScroller.scrollIntoView(event.target);
	});
};

})();
