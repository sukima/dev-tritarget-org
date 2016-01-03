
/*\
title: $:/plugins/sukima/comments/confirm-modal.js
type: application/javascript
module-type: utils

Confirm terms of use modal dialog

\*/
const TERMS_CONFIG_TIDDLER   = '$:/config/comments/TermsOfUseTiddler';
const CONFIRM_MODAL_TIDDLER  = '$:/plugins/sukima/comments/ConfirmModal';

class Eventer {
  constructor() {
    this.events = {};
  }
  
  register(message, callback) {
    this.events[message] = true;
    $tw.rootWidget.addEventListener(message, (...args) => {
      this.unregisterAll();
      callback(...args);
    });
  }

  unregisterAll() {
    Object.keys(this.events).forEach(message => {
      delete $tw.rootWidget.eventListeners[message];
    });
  }
}

export default class ConfirmModal {
  constructor() {
    this.logger = new $tw.utils.Logger('confirm-modal');
  }

  get termsTiddler() {
    return $tw.wiki.getTiddlerText(TERMS_CONFIG_TIDDLER);
  }

  display() {
    if (!this.termsTiddler) {
      this.logger.log('Terms of Use tiddler does not exist. Skipping confirmation modal popup.');
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const events = new Eventer();
      events.register('tm-confirm-accept', () => {
        this.logger.log('Terms of Use accepted.');
        resolve();
      });
      events.register('tm-confirm-decline', ({paramObject}) => {
        this.logger.log('Terms of Use declined.');
        reject(new Error(paramObject.text));
      });
      this.logger.log('Displaying Terms of Use confirmation modal popup.');
      $tw.modal.display(CONFIRM_MODAL_TIDDLER);
    });
  }
}
