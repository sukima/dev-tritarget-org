
/*\
title: $:/plugins/sukima/pannellum/widget.js
type: application/javascript
module-type: widget

A TiddlyWiki widget to embed a Pannellum panorama viewer.
\*/
import '$:/plugins/sukima/pannellum/pannellum.js';
import { widget as Widget } from '$:/core/modules/widgets/widget.js';

class ConfigError {
  constructor(message) {
    this.name = 'ConfigError';
    this.message = message;
  }
}
ConfigError.prototype = Object.create(Error.prototype);

class PanoramaWidget extends Widget {
  render(parent, nextSibling) {
    this.computeAttributes();
    this.parentDomNode = parent;
    this.execute();

    const domNode = $tw.browser ? this.buildPanellumDom() : this.buildStaticDom();

    this.domNodes.push(domNode);
    parent.insertBefore(domNode, nextSibling);
  }

  buildStaticDom() {
    return $tw.utils.domMaker('div', {
      document: this.document,
      text: 'This panorama requires JavaScript to view'
    });
  }

  buildPanellumDom() {
    let domNode;
    try {
      const config = this.loadConfig();
      const viewerDom = this.document.createElement('div');
      domNode = $tw.utils.domMaker('div', {
        document: this.document,
        class: 'tc-pannellum',
        children: [viewerDom]
      });
      pannellum.viewer(viewerDom, config);
    } catch (err) {
      if (err instanceof ConfigError) {
        domNode = $tw.utils.domMaker('div', {
          document: this.document,
          class: 'tc-error-form',
          text: String(err)
        });
      } else {
        throw err;
      }
    }
    return domNode;
  }

  loadConfig() {
    const configTiddler = this.wiki.getTiddler(this.getAttribute('config'));
    if (configTiddler) {
      if (configTiddler.fields.type !== 'application/json') {
        throw new ConfigError(`${this.getAttribute('config')} must have type application/json`);
      }
      try {
        return JSON.parse(configTiddler.fields.text);
      } catch (err) {
        throw new ConfigError(err);
      }
    } else {
      let panorama = this.getAttribute('url');
      let preview = this.getAttribute('preview');
      if (!panorama) {
        throw new ConfigError('a "url" or "config" attribute is missing');
      }
      return {panorama, preview};
    }
  }

  refresh(changedTiddlers) {
    const changedAttributes = this.computeAttributes();
    const attrs = ['url', 'config'];
    const hasChanges = attrs.some(attr => changedAttributes[attr]);
    if (hasChanges) {
      this.refreshSelf();
      return true;
    }
    return super.refresh(changedTiddlers);
  }
}

export { PanoramaWidget as panorama };
