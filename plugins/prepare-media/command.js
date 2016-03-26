
/*\
title: $:/plugins/sukima/prepare-media/command.js
type: application/javascript
module-type: command

generator command to prep and create media tiddlers

\*/
/*globals Promise:true*/
let Promise, util, fs, path, mktemp, child_process, del, gm, generateTiddlerFilename;
const CDN_DOMAIN = 'photos.tritarget.org';
const RSYNC_COMMAND = 'rsync -rzv --progress %s ktohg@tritarget.org:photos.tritarget.org';
const PANO_TYPE = 'image/prs.panorama';

// Can not use import because requires must be dynamic so it doesn't
// execute when included in the browser.
function loadModules() {
  if (!$tw.node) { return; }
  Promise = require('bluebird');
  util = require('util');
  fs = Promise.promisifyAll(require('fs-extra'));
  path = require('path');
  mktemp = require('mktemp');
  child_process = Promise.promisifyAll(require('child_process'));
  del = require('del');
  gm = require('gm');
  generateTiddlerFilename =
    require('$:/plugins/tiddlywiki/filesystem/filesystemadaptor.js')
    .adaptorClass.prototype.generateTiddlerFilename;
}

class MediaPrepError {
  constructor(arg) {
    if (arg instanceof Error) {
      this.message = arg.message;
      this.stack = arg.stack;
    } else {
      this.message = arg;
      this.stack = Error.captureStackTrace(this, MediaPrepError);
    }
  }
}
MediaPrepError.prototype = Object.create(Error.prototype);
MediaPrepError.prototype.name = 'MediaPrepError';

// These modules run in a vm.runWithThisContext Bluebird performs an object ref
// check on Error to manage catch() predicates and since that executes outside
// the run context the Error used here is different then the Error used by
// bluebird  at runtime. this means when bluebird checks for a predicate
// MediaPrepError.prototype !== Error and things go bad. Using the predicate
// method instead saves that non-sense.
function isMediaPrepError(e) {
  return e.name === 'MediaPrepError';
}

function spawnAsync(command, args, progress) {
  return new Promise((resolve, reject) => {
    const cp = child_process.spawn(command, args, {stdio: 'inherit'});
    cp.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new MediaPrepError(`${command} had non zero exit code: ${code}.`));
      }
    });
    if (progress) {
      cp.on('data', stdout => progress(stdout.toString()));
    }
  });
}

function trimSlash(str) {
  return str.replace(/(?:^\/+|\/+$)/, '');
}

class Editor {
  constructor(editor) {
    this.editor = editor || process.env.EDITOR || 'vi';
    this.promise = Promise.resolve(mktemp.createDir('prepare-media.XXXXX'))
      .then(tempDir => {
        this.tempDir = tempDir;
        return this;
      });
  }

  writeFile(file, content) {
    return fs.writeFileAsync(file, content).then(() => file);
  }

  readFile(file) {
    return fs.readFileAsync(file).then(content => {
      return {file, content: content.toString()};
    });
  }

  editFile(file) {
    const postLogs = [];
    const origLog = console.log;
    console.log = (...args) => postLogs.push(args);
    return spawnAsync(this.editor, [file])
      .return(file)
      .finally(() => {
        console.log = origLog;
        postLogs.forEach(args => console.log(...args));
      });
  }

  editContent(origContent) {
    return this.promise
      .then(({tempDir}) => path.join(tempDir, 'prep-list.json'))
      .then(file => this.writeFile(file, origContent))
      .then(file => this.editFile(file))
      .then(file => this.readFile(file))
      .then(({file, content}) => del(file).then(() => content));
  }

  destroy() {
    return del(this.tempDir);
  }
}

class Media {
  constructor(data, tempDir) {
    $tw.utils.extend(this, data);
    this.tempDir = tempDir;
    this.output = trimSlash(this.output);
  }
  mkdir() {
    if (!this.outputDirPromise) {
      this.outputDirPromise = fs.mkdirsAsync(this.outputDir);
    }
    return this.outputDirPromise;
  }
  processImages() {
    return Promise.join(
      this.makeImage().then(() => {
        console.log(`Completed image processing: ${this.outputFile}`);
      }),
      this.makeThumb().then(() => {
        console.log(`Completed thumbnail processing: ${this.outputThumb}`);
      })
    );
  }
  saveTiddlers(wiki) {
    return Promise.join(
      this.saveImgTiddler(wiki),
      this.saveThumbTiddler(wiki),
      this.saveThumbImgTiddler(wiki)
    );
  }
  addNewTiddler(wiki, filepath, params) {
    if (wiki.getTiddler(params.title)) {
      $tw.utils.warning(`${params.title} tiddler already exists skipping.`);
      return;
    }
    const tiddlerPath = path.join($tw.boot.wikiTiddlersPath, filepath);
    $tw.boot.files[params.title] = {
      filepath: tiddlerPath,
      fileType: 'application/x-tiddler',
      extension: '.tid',
      type: 'application/x-tiddler'
    };
    return fs.mkdirsAsync(path.dirname(tiddlerPath))
      .then(() => wiki.addTiddler(new $tw.Tiddler(params)));
  }
}

class Pano extends Media {
  constructor(...args) {
    super(...args);
    this.extname = '.jpg';
    this.basePath = path.join('panoramas', this.output);
    this.outputDir = path.join(this.tempDir, this.basePath);
    this.outputFile = path.join(this.outputDir, 'panorama.jpg');
    this.outputThumb = path.join(this.outputDir, 'preview.jpg');
    this.mediaUrl = `//${CDN_DOMAIN}/${this.basePath}/panorama.jpg`;
    this.mediaThumbUrl = `//${CDN_DOMAIN}/${this.basePath}/preview.jpg`;
    this.logger = new $tw.utils.Logger('prepare-media-pano');
  }
  makeImage() {
    return this.mkdir().then(() => {
      return Promise.fromCallback(resolver => {
        this.logger.log(`Resizing ${this.outputFile} to 4096x2048`);
        gm(this.input)
          .resize(4096, null, '>')
          .write(this.outputFile, resolver);
      });
    });
  }
  makeThumb() {
    return this.mkdir().then(() => {
      return Promise.fromCallback(resolver => {
        this.logger.log(`Creating thumbnail ${this.outputThumb}`);
        gm(this.input)
          .define('jpeg:size=600x300')
          .thumbnail('280', '157^')
          .gravity('Center')
          .extent(280, 157)
          .write(this.outputThumb, resolver);
      });
    });
  }
  saveImgTiddler(wiki) {
    return this.addNewTiddler(wiki, `${this.basePath}/panorama.tid`, {
      title: this.title,
      tags: ['Panoramas'],
      text: `<$panorama url="${this.mediaUrl}"/>\n`
    });
  }
  saveThumbImgTiddler(wiki) {
    return this.addNewTiddler(wiki, `${this.basePath}/thumbnail_image.tid`, {
      title: `${this.title} Thumbnail Image`,
      type: 'image/jpeg',
      _canonical_uri: this.mediaThumbUrl,
      text: ''
    });
  }
  saveThumbTiddler(wiki) {
    return this.addNewTiddler(wiki, `${this.basePath}/thumbnail.tid`, {
      title: `${this.title} Thumbnail`,
      tags: ['PanoThumbnail'],
      caption: this.title,
      image: `${this.title} Thumbnail Image`,
      link: this.title
    });
  }
}

class Photo extends Media {
  constructor(...args) {
    super(...args);
    const baseDir = path.join(this.tempDir, 'photos');
    const parts = path.parse(this.output);
    const thumbName = `${trimSlash(parts.name)}_t${parts.ext}`;
    this.basePath = path.join('photos', this.output);
    this.outputDir = path.join(baseDir, parts.dir);
    this.outputFile = path.join(baseDir, this.output);
    this.outputThumb = path.join(baseDir, parts.dir, thumbName);
    this.mediaUrl = `//${CDN_DOMAIN}/${this.basePath}`;
    this.mediaThumbUrl = [
      `//${CDN_DOMAIN}`, 'photos', trimSlash(parts.dir), thumbName
    ].filter(item => item && item !== '').join('/');
    this.logger = new $tw.utils.Logger('prepare-media-photo');
  }
  makeImage() {
    return this.mkdir().then(() => {
      this.logger.log(`Storing image ${this.outputFile}`);
      return fs.linkAsync(this.input, this.outputFile)
        .catch(() => fs.copyAsync(this.input, this.outputFile));
    });
  }
  makeThumb() {
    return this.mkdir().then(() => {
      return Promise.fromCallback(resolver => {
        this.logger.log(`Creating thumbnail ${this.outputThumb}`);
        gm(this.input)
          .thumbnail('', '128^')
          .gravity('Center')
          .extent(null, 128)
          .write(this.outputThumb, resolver);
      });
    });
  }
  saveImgTiddler(wiki) {
    const title = this.title;
    const fileName = generateTiddlerFilename(title, '.tid', []);
    return this.addNewTiddler(wiki, path.join('photos', fileName), {
      title,
      tags: ['Photos'],
      type: this.type,
      _canonical_uri: this.mediaUrl
    });
  }
  saveThumbImgTiddler(wiki) {
    const title = `${this.title} Thumbnail Image`;
    const fileName = generateTiddlerFilename(title, '.tid', []);
    return this.addNewTiddler(wiki, path.join('photos', fileName), {
      title,
      tags: ['PhotoThumbnail'],
      type: this.type,
      _canonical_uri: this.mediaThumbUrl
    });
  }
  saveThumbTiddler(wiki) {}
}

export const info = {
  name: 'prepare-media',
  platforms: ['node'],
  synchronous: false
};

export class Command {
  constructor(params, commander, callback) {
    loadModules();
    this.params = params;
    this.commander = commander;
    this.callback = callback;
  }

  fetchFileList(paths) {
    return new Promise((resolve, reject) => {
      if (paths.length === 0) {
        throw new MediaPrepError('Missing file(s) for processing.');
      }
      const args = [...paths, '-type', 'f'];
      child_process.execFile('find', args, (err, stdout, stderr) => {
        if (err) {
          err.message = `${err.message}\n${stderr.toString()}`;
          reject(err);
        } else {
          const result = stdout.toString()
            .split('\n')
            .filter(line => line !== '');
          resolve(result);
        }
      });
    });
  }

  isPossiblePano(size) {
    return (size && size.width > 3000 && size.width === size.height * 2);
  }

  getMimeType(ext) {
    switch (ext) {
      case '.jpg': return 'image/jpeg';
      case '.tif': return 'image/tiff';
      default: return `image/${ext.substr(1)}`;
    }
  }

  defaultFileData(file) {
    return Promise.fromCallback(resolver => gm(file).size(resolver))
      .then(size => {
        const isPano = this.isPossiblePano(size);
        const name = path.basename(file, path.extname(file));
        const title = name.charAt(0).toUpperCase() + name.slice(1);
        const output = isPano ? `${name}/` : path.basename(file);
        const type = isPano ? PANO_TYPE : this.getMimeType(path.extname(file));
        return {type, title, output, input: file};
      })
      .catch(err => {
        $tw.utils.warning(err.toString());
        return null;
      });
  }

  processData(mediaData, tempDir) {
    const wiki = this.commander.wiki;
    const media = mediaData.type === PANO_TYPE ?
      new Pano(mediaData, tempDir) :
      new Photo(mediaData, tempDir);
    return Promise.join(
      media.saveTiddlers(this.commander.wiki),
      media.processImages()
    );
  }

  editMediaList(editor, list) {
    if (list.length === 0) {
      throw new MediaPrepError('No suitable images found.');
    }
    return editor.editContent(`${JSON.stringify(list, null, 2)}\n`)
      .then(content => {
        if (content === '') {
          throw new MediaPrepError('Nothing to do.');
        }
        try {
          return JSON.parse(content);
        } catch (e) {
          throw new MediaPrepError(e);
        }
      });
  }

  disposableEditor() {
    return new Editor().promise.disposer(editor => editor.destroy());
  }

  uploadMedia(tempDir) {
    console.log('Uploading media...');
    const [command, ...args] = RSYNC_COMMAND.split(' ')
      .map(arg => (arg === '%s') ? `${tempDir}/` : arg);
    return spawnAsync(command, args, progress => {
      console.log(progress);
    });
  }

  execute() {
    Promise.using(this.disposableEditor(), editor => {
      return this.fetchFileList(this.params)
        .map(file => this.defaultFileData(file))
        .filter(media => media !== null)
        .then(list => this.editMediaList(editor, list))
        .map(media => this.processData(media, editor.tempDir))
        .then(() => this.uploadMedia(editor.tempDir));
    })
    .catch(isMediaPrepError, error => {
      console.log(`${error.toString()} Aborting.`);
    })
    .catch(error => {
      this.callback(error.stack || error.message || error);
    })
    .then(() => this.callback(null));
  }
}
