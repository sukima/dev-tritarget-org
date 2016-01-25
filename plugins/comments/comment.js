
/*\
title: $:/plugins/sukima/comments/comment.js
type: application/javascript
module-type: utils

Represents a comment.

\*/
import md5 from '$:/plugins/sukima/md5/md5.js';
import CommentService, { ValidationError } from
  '$:/plugins/sukima/comments/comment-service.js';

const COMMENT_TIDDLER_TAG = '$:/tags/Comment';
const UNSENT_TAG = 'Unsent';

const NoComment = {
  sent: true,
  validate() { throw new TypeError('Not a comment'); },
  canSubmit() { return false; },
  updateArticle() {},
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
      .then(this.removeUnsentTag.bind(this))
      .then(() => this);
  }

  updateArticle() {
    const title = this.commentTiddlerTitle;
    const text = [
      ($tw.wiki.getTiddlerText(title) || ''),
      '<$set name="inReview" value="true">',
      ...this.commentLines,
      '</$set>'
    ].join('\n');
    $tw.wiki.setText(title, 'text', null, text);
    return this;
  }

  removeUnsentTag() {
    this.sent = true;
    const tags = this.tiddler.fields.tags
      .filter(tag => tag !== UNSENT_TAG);
    this.tiddler = new $tw.Tiddler(this.tiddler, {tags});
    $tw.wiki.deleteTiddler(this.title);
    $tw.wiki.addTiddler(this.tiddler);
  }

  get commentTiddlerTitle() {
    return `$:/comments/${this.article}`;
  }

  get tidFilename() {
    let filename = this.article.replace(/<|>|\:|\"|\/|\\|\||\?|\*|\^|\s/g,"_");
    if (filename.length > 200) {
      filename = filename.substr(0, 200);
    }
    return `tiddlers/comments/${filename}.tid`;
  }

  get gravatarHash() {
    const gravatarEmail = this.author.email.trim().toLowerCase();
    return md5(gravatarEmail);
  }

  get datetime() {
    return new Date().toISOString();
  }

  get commentLines() {
    return [
      `<$comment name="${this.author.name}" gravatar="${this.gravatarHash}" date="${this.datetime}" url="${this.author.url}">`,
      '',
      ...this.tiddler.getFieldString('text').split('\n'),
      '',
      '</$comment>'
    ];
  }

  getCommentsTidFile(currentTiddler = this.commentTiddlerTitle) {
    if (!$tw.wiki.getTiddler(currentTiddler)) {
      return '';
    }
    const renderArgs = [
      'text/plain',
      '$:/core/templates/tid-tiddler',
      {variables: {currentTiddler}}
    ];
    this.logger.log(`Rendering current comments for ${this.article}.`);
    return $tw.wiki.renderTiddler(...renderArgs);
  }

  createPatch() {
    const filePath = this.tidFilename;
    const oldLines = this.getCommentsTidFile().split('\n');
    const newLines = this.commentLines.map(line => `+${line}`);
    const firstComment = oldLines.length === 1 && oldLines[0] === '';
    const startIndex = firstComment ? 0 : oldLines.length;
    if (firstComment) {
      this.logger.log(`First comment for ${this.article} creating comments tiddler.`);
      newLines.unshift(`+title: ${this.commentTiddlerTitle}`, '+type: text/vnd.tiddlywiki', '+');
    }
    return [
      `From: ${this.author.name} <${this.author.email}>`,
      '',
      `${this.author.name} has requested to add the following comment.`,
      this.author.url ? `URL: ${this.author.url}` : null,
      '',
      `diff --git a/${filePath} b/${filePath}`,
      firstComment ? 'new file mode 100644' : null,
      firstComment ? '--- /dev/null' : `--- a/${filePath}`,
      `+++ b/${filePath}`,
      `@@ -${startIndex},0 +${oldLines.length},${newLines.length} @@`,
      ...newLines
    ].filter(line => line !== null).join('\n');
  }

  toJSON() {
    return {
      name:    this.author.name,
      email:   this.author.email,
      subject: `[PATCH] Add comment to ${this.article}`,
      message: this.createPatch()
    };
  }

  static findByTitle(title) {
    const tiddler = $tw.wiki.getTiddler(title);
    return tiddler && tiddler.hasTag(COMMENT_TIDDLER_TAG) ?
      new Comment(tiddler) : NoComment;
  }
}
