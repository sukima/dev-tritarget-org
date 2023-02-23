
/*\
title: $:/plugins/sukima/obfuscate/parser.js
type: application/javascript
module-type: parser

A text/prs.obfuscated parser

Had to design my own tree builder because the type: 'raw' forces a <div>
wrapper making the result unable to be inline semantically.

\*/
(function () {
  function *attrs(attrList) {
    for (let attr of attrList)
      yield [attr.name, { type: 'string', value: attr.value }];
  }

  function *treeFromNodes(nodes) {
    for (let node of nodes) {
      if (node instanceof Text) {
        yield { type: 'text', text: node.data };
      } else {
        yield {
          type: 'element',
          tag: node.tagName.toLowerCase(),
          attributes: Object.fromEntries(attrs(node.attributes)),
          children: Array.from(treeFromNodes(node.childNodes)),
        };
      }
    }
  }

  function treeFromHtml(html) {
    let div = document.createElement('div');
    div.innerHTML = html;
    return Array.from(treeFromNodes(div.childNodes));
  }

  exports['text/prs.obfuscated'] = function ObfuscateParser(type, text, options) {
    if ($tw.browser) {
      this.tree = treeFromHtml($tw.utils.deobfuscate(text));
      console.log(3, this.tree);
    } else {
      this.tree = [{
        type: 'text',
        text: 'This page has obfuscated content to protect from site scrappers. It can only be viewed in the JavaScript version.'
      }];
    }
  };
})();
