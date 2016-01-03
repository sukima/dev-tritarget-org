
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
      class: 'tc-widget-comment-body'
    });
    const domNode = $tw.utils.domMaker('div', {
      class: 'tc-widget-comment',
      children: [headerNode, bodyNode]
    });

    this.renderChildren(bodyNode, null);
    this.domNodes.push(domNode);
    parent.insertBefore(domNode, nextSibling);
  }

  refresh(changedTiddlers) {
    const changedAttributes = this.computeAttributes();
    const attrs = ['name', 'email', 'date'];
    const hasChanges = attrs.some(attr => changedAttributes[attr]);
    if (hasChanges) {
      this.refreshSelf();
      return true;
    }
    return super.refresh(changedTiddlers);
  }

  get displayName() { return this.getAttribute('name'); }

  get email() { return this.getAttribute('email'); }

  get datetime() { return this.getAttribute('date'); }

  get displayDate() {
    const date = new Date(this.datetime);
    const format = this.wiki.getTiddlerText('$:/language/Tiddler/DateFormat');
    return $tw.utils.formatDateString(date, format);
  }

  get profileUrl() {
    return this.getAttribute('url') ||
      `http://gravatar.com/${this.getAttribute('gravatar')}`;
  }

  get avatarUrl() {
    return `http://gravatar.com/avatar/${this.getAttribute('gravatar')}`;
  }
}

export { CommentWidget as comment };
