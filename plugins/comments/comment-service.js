
/*\
title: $:/plugins/sukima/comments/comment-service.js
type: application/javascript
module-type: utils

Represents a service that sends comments to a server.

\*/
const URL_CONFIG_TIDDLER  = '$:/config/comments/host';

function message(msg) {
  return `${msg}. Please edit and save the tiddler to try again.`;
}

export class ServerError extends Error {
  constructor(msg) {
    super();
    this.name = 'ServerError';
    this.message = message(msg);
  }
}

export class ValidationError extends Error {
  constructor(errors) {
    super();
    this.name = 'ValidationError';
    this.errors = errors;
    const messages = Object.keys(errors)
      .map((key) => `${key} ${errors[key]}`)
      .join('. ');
    this.message = message(messages);
  }
}

function createResponse(err, result) {
  try {
    result = JSON.parse(result);
  } catch(parseErr) {
    result = err || parseErr;
  }
  switch (result.status) {
    case 'success': return result;
    case 'fail': return new ValidationError(result.data);
    default: return new ServerError(result.message || result);
  }
}

export default class CommentService {
  constructor(comment) {
    this.comment = comment;
    this.logger = new $tw.utils.Logger('comment-service');
  }

  submit() {
    return new Promise((resolve, reject) => {
      this.logger.log(`Submitting ${this.comment.title} to server`);
      const http = $tw.utils.httpRequest({
        url:      CommentService.postUrl,
        type:     'POST',
        data:     this.comment.toJSON(),
        callback: err => {
          this.logger.log(`server responded with ${http.status}: ${http.responseText}`);
          const res = createResponse(err, http.responseText);
          if (res instanceof Error) { reject(res); }
          else { resolve(res); }
        }
      });
    })
    .then(result => {
      this.serverResponse = result;
      return this.comment;
    });
  }

  static get postUrl() {
    return $tw.wiki.getTiddlerText(URL_CONFIG_TIDDLER, '/comments');
  }
}
