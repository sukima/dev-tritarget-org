
/*\
title: $:/plugins/sukima/comments/confirm-dialog.js
type: application/javascript
module-type: utils

A Modal dialog for confirming user input.

\*/
export default class ConfirmModal {
  constructor(title) {
    this.title         = title;
    this.tiddler       = $tw.wiki.getTiddler(title);
    this.animationTime = $tw.utils.getAnimationDuration();
    this.handleClick   = this.handleClick.bind(this);
  }

  show() {
    this.wrapper  = document.createElement('div');
    this.backdrop = this.buildBackdrop();
    this.modal    = this.buildModal();
    this.modal.addEventListener('click', this.handleClick);
    wrapper.appendChild(this.backdrop);
    wrapper.appendChild(this.modal);
    document.body.appendChild(this.wrapper);
    this.registerModal();
    this.animateIn();
  }

  hide() {
    this.modal.removeEventListener('click', this.handleClick);
    this.unregisterModal();
    this.animateOut();
    setTimeout(() => {
      document.body.removeChild(this.wrapper);
      this.modal    = null;
      this.backdrop = null;
      this.wrapper  = null;
    }, this.animationTime);
  }

  handleClick(evt) {
  }

  animateIn() {
    $tw.utils.forceLayout(this.backdrop);
    $tw.utils.forceLayout(this.modal);
    $tw.utils.setStyle(backdrop, [{opacity: '0.7'}]);
    $tw.utils.setStyle(modal, [{transform: 'translateY(0px)'}]);
  }

  animateOut() {
    $tw.utils.forceLayout(this.backdrop);
    $tw.utils.forceLayout(this.modal);
    $tw.utils.setStyle(this.backdrop, [{opacity: '0'}]);
    $tw.utils.setStyle(this.modal, [{transform: `translateY(${window.innerHeight}px)`}]);
  }

  buildModal() {
    const innerHTML = `
      <div class="tc-modal-header">
        <h3>${this.title}</h3>
      </div>
      <div class="tc-modal-body"></div>
      <div class="tc-modal-footer">
        <button class="tc-modal-confirm-button agree" style="float:left;">Agree</button>
        <button class="tc-modal-confirm-button disagree">Disagree</button>
      </div>`;
    const domNode = $tw.utils.domMaker('div', {class: 'tc-modal', innerHTML});

    $tw.utils.makeTranscludeWidget(this.title, {
      parentWidget: $tw.rootWidget,
      document:     document,
      variables:    {currentTiddler: this.title}
    })
    .render(domNode.querySelector('.tc-modal-body'), null);

    const transformProp = $tw.utils.roundTripPropertyName('transform');
    $tw.utils.setStyle(domNode, [{
      transformOrigin: '0% 0%',
      transform: `translateY(${-window.innerHeight}px)`,
      transition: `${transformProp} ${this.animationTime} ms ease-in-out`
    }]);

    return domNode;
  }

  buildBackdrop() {
    const domNode = $tw.util.domMaker('div', {class: 'tc-modal-backdrop'});
    $tw.utils.setStyle(domNode, [{
      opacity:    '0',
      transition: `opacity ${this.animationTime} ms ease-out`
    }]);
    return domNode;
  }

  registerModal() {
    $tw.modal.modalCount++;
    $tw.modal.adjustPageClass();
  }

  unregisterModal() {
    $tw.modal.modalCount--;
    $tw.modal.adjustPageClass();
  }

  get promise() {}
}
