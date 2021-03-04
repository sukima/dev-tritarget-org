
/*\
title: $:/plugins/sukima/insecure-alert
type: application/javascript
module-type: startup

Tell the user if they are using the site though HTTP and not HTTPS

\*/
function envDevelopmnt() {
  return /\/\/(localhost|127.0.0.1|0.0.0.0)/.test(window.location.href);
}

exports.startup = function() {
  if ($tw.browser && /^http:/.test(window.location.href) && !envDevelopmnt()) {
    var newUrl = window.location.href.replace(/^http:/, 'https:');
    $tw.wiki.addTiddler(new $tw.Tiddler({
      title: '$:/temp/alerts/InsecureProtocol',
      tags: ['$:/tags/Alert'],
      component: 'Insecure Warning',
      modified: $tw.utils.stringifyDate(new Date()),
      text: 'You are connecting to this site with the HTTP protocal which is insecure. Though there is nothing on this site that is sesitive it is still able to be hacked. Please concider connecting to this site using HTTPS: <a target="_self" href="' + newUrl + '">~' + newUrl + '</a>'
    }));
  }
};
