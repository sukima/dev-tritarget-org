
/*\
title: $:/plugins/sukima/comments/comment-widget.js
type: application/javascript
module-type: widget

A comment formatting widget

\*/

import { widget as Widget } from '$:/core/modules/widgets/widget.js';

class CommentWidget extends Widget {
  render(parent, nextSibling) {
    this.computeAttributes();
    this.parentDomNode = parent;
    this.execute();

    const headerNode = $tw.utils.domMaker('div', {
      document: this.document,
      class: 'tc-widget-comment-header',
      innerHTML: `
        <a href="${this.profileUrl}" target="_blank" class="tc-tiddlylink-external">
          <img class="tc-widget-comment-avatar" src="${this.avatarUrl}" alt="avatar image">
          <div class="tc-widget-comment-name">${this.displayName}</div>
        </a>
        <time class="tc-widget-comment-date" datetime="${this.datetime}">${this.displayDate}</time>
        <div class="clearfix"></div>`
    });
    const bodyNode = $tw.utils.domMaker('div', {
      document: this.document,
      class: 'tc-widget-comment-body'
    });
    const inReview = this.getVariable('inReview') === 'true';
    const domNode = $tw.utils.domMaker('div', {
      document: this.document,
      class: `tc-widget-comment ${inReview ? 'tc-widget-comment-pending' : ''}`,
      children: [headerNode, bodyNode]
    });

    this.renderChildren(bodyNode, null);
    this.domNodes.push(domNode);
    parent.insertBefore(domNode, nextSibling);
  }

  refresh(changedTiddlers) {
    const changedAttributes = this.computeAttributes();
    const attrs = ['name', 'date', 'gravatar', 'url'];
    const hasChanges = attrs.some(attr => changedAttributes[attr]);
    if (hasChanges) {
      this.refreshSelf();
      return true;
    }
    return super.refresh(changedTiddlers);
  }

  get displayName() { return this.getAttribute('name'); }

  get datetime() { return this.getAttribute('date'); }

  get displayDate() {
    const date = new Date(this.datetime);
    const format = this.wiki.getTiddlerText('$:/language/Tiddler/DateFormat');
    return $tw.utils.formatDateString(date, format);
  }

  get profileUrl() {
    return this.getAttribute('url') ||
      `//gravatar.com/${this.getAttribute('gravatar')}`;
  }

  get avatarUrl() {
    return `//gravatar.com/avatar/${this.getAttribute('gravatar')}.png`;
  }
}

export { CommentWidget as comment };
