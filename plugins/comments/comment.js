
/*\
title: $:/plugins/sukima/comments/comment.js
type: application/javascript
module-type: utils

Represents a comment.

\*/
import CommentService, { ValidationError } from
  '$:/plugins/sukima/comments/comment-service.js';

const COMMENT_TIDDLER_TAG = '$:/tags/Comment';
const UNSENT_TAG = 'Unsent';

const NoComment = {
  sent: true,
  validate() { throw new TypeError('Not a comment'); },
  canSubmit() { return false; },
  submit() {}
};

export default class Comment {
  constructor(tiddler) {
    this.sent    = false;
    this.tiddler = tiddler;
    this.title   = this.tiddler.getFieldString('title');
    this.article = this.tiddler.getFieldString('comment-for');
    this.author  = {
      name:  this.tiddler.getFieldString('author-name'),
      email: this.tiddler.getFieldString('author-email'),
      url:   this.tiddler.getFieldString('author-url')
    };
    this.logger = new $tw.utils.Logger('comment');
  }

  validate() {
    if (!this.author.name) {
      throw new ValidationError({'author-name': 'cannot be blank'});
    }
    if (!this.author.email) {
      throw new ValidationError({'author-email': 'cannot be blank'});
    }
  }

  canSubmit() {
    return !this.tiddler.isDraft();
  }

  submit() {
    return Promise.resolve()
      .then(this.validate.bind(this))
      .then(() => new CommentService(this).submit())
      .then(this.removeUnsentTag.bind(this));
  }

  removeUnsentTag() {
    this.sent = true;
    const tags = this.tiddler.fields.tags
      .filter(tag => tag !== UNSENT_TAG);
    this.tiddler = new $tw.Tiddler(this.tiddler, {tags});
    $tw.wiki.deleteTiddler(this.title);
    $tw.wiki.addTiddler(this.tiddler);
  }

  toJSON() {
    return {
      tiddler:        `$:/comments/${this.article}`,
      'author-name':  this.author.name,
      'author-email': this.author.email,
      'author-url':   this.author.url,
      body:           this.tiddler.getFieldString('text')
    };
  }

  static findByTitle(title) {
    const tiddler = $tw.wiki.getTiddler(title);
    return tiddler && tiddler.hasTag(COMMENT_TIDDLER_TAG) ?
      new Comment(tiddler) : NoComment;
  }
}
