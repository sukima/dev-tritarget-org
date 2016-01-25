
/*\
title: $:/plugins/sukima/comments/comment-submitter.js
type: application/javascript
module-type: startup

New comment handling

\*/
import Comment from '$:/plugins/sukima/comments/comment.js';
import ConfirmModal from '$:/plugins/sukima/comments/confirm-modal.js';

const COMMENTS_SAVED_MESSAGE = '$:/plugins/sukima/comments/CommentsSavedMessage';

class CommentSubmitter {
  constructor() {
    this.logger = new $tw.utils.Logger('comment-submitter');
  }

  handleChangeEvent(changes) {
    this.submitComments(Object.keys(changes)
      .filter(key => !changes[key].deleted)
      .map(title => Comment.findByTitle(title))
      .filter(comment => comment.canSubmit())
    );
  }

  submitComments(comments) {
    if (comments.length === 0) { return; }
    return Promise.resolve()
      .then(this.validateAll.bind(this, comments))
      .then(this.displayTermsOfUse.bind(this))
      .then(this.waitForSubmissions.bind(this, comments))
      .then(this.updateArticles.bind(this))
      .then(this.notifyFinished.bind(this))
      .catch(this.notifyError.bind(this));
  }

  validateAll(comments) {
    comments.forEach(comment => comment.validate());
  }

  displayTermsOfUse() {
    return new ConfirmModal().display();
  }

  waitForSubmissions(comments) {
    return Promise.all(comments.map(comment => comment.submit()));
  }

  updateArticles(submissions) {
    submissions.forEach(comment => comment.updateArticle());
    return submissions;
  }

  notifyFinished(submissions) {
    if (submissions.length > 0) {
      $tw.notifier.display(COMMENTS_SAVED_MESSAGE);
    }
    return submissions;
  }

  notifyError(error) {
    this.logger.alert(error.toString());
  }

  attachEvents() {
    $tw.wiki.addEventListener('change', this.handleChangeEvent.bind(this));
  }
}

export function startup() {
  if ($tw.browser) {
    new CommentSubmitter().attachEvents();
  }
}
