/* global -Promise */
var _          = require('lodash');
var Promise    = require('bluebird');
var fs         = Promise.promisifyAll(require('fs'));
var spawn      = require('child_process').spawn;
var http       = require('http');
var del        = require('del');
var path       = require('path');
var gulp       = require('gulp');
var gutil      = require('gulp-util');
var babel      = require('gulp-babel');
var rename     = require('gulp-rename');
var livereload = require('gulp-livereload');
var debug      = require('debug')('gulpfile');
var libs       = require('./config/libraries');

var runningProcess;
var babelrc = JSON.parse(fs.readFileSync('./.babelrc'));

function loadJson(file) {
  debug('loading JSON file %s', file);
  return fs.readFileAsync(file).then(function(data) {
    return JSON.parse(data);
  });
}

function includeLibsStream(libs) {
  return gulp.src(_.map(libs, 'srcfile'), {base: '.'})
    .pipe(rename(function(lib) {
      var srcfile = path.join(lib.dirname, lib.basename + lib.extname);
      lib.dirname = _.findWhere(libs, {srcfile: srcfile}).destpath;
    }));
}

function assertWikiDir() {
  return new Promise(function(resolve, reject) {
    try {
      if (!fs.statSync('wiki').isDirectory()) {
        reject(new Error('EEXISTS: wiki exists but is not a directory'));
      }
      debug('wiki directory exists');
    } catch(e) {
      debug('wiki directory does not exist, creating…');
      fs.mkdirSync('wiki');
    }
    resolve();
  });
}

function compileConfigTask(env) {
  return function() {
    var promises = [
      loadJson('config/tiddlywiki.info'),
      loadJson('config/includes.json').get(env),
      assertWikiDir()
    ];
    return Promise.all(promises).spread(function(config, includes) {
      _.forEach(includes, function(values, key) {
        config[key] = _(config[key]).concat(values).uniq();
      });
      var data = JSON.stringify(config, null, 2);
      debug('Writing wiki/tiddlywiki.info');
      return fs.writeFileAsync('wiki/tiddlywiki.info', data);
    });
  };
}

function spawnProcess(cmd, args, options) {
  debug('Spawning %s %s', cmd, args.join(' '));
  var p = spawn(cmd, args, options);
  p.stdout.pipe(process.stdout);
  p.stderr.pipe(process.stderr);
  return p;
}

function waitForProcess(spawnedProcess) {
  return new Promise(function(resolve, reject) {
    debug('Waiting for process');
    spawnedProcess.on('close', resolve);
    spawnedProcess.on('error', reject);
  });
}

function ignoreErrors(stream) {
  return stream.on('error', function(err) {
    console.error(err.message);
    if (err.codeFrame) {
      process.stderr.write(err.codeFrame);
    }
    stream.end();
  });
}

gulp.task('config-production', compileConfigTask('production'));
gulp.task('config-development', compileConfigTask('development'));

gulp.task('babel-plugins', function() {
  return gulp.src('plugins/**/*.js')
    .pipe(ignoreErrors(babel(babelrc)))
    .pipe(gulp.dest('wiki/plugins'));
});

gulp.task('files-plugins', function() {
  return gulp.src(['plugins/**/*.*', '!**/*.js'])
    .pipe(gulp.dest('wiki/plugins'));
});

gulp.task('plugin-libraries', function() {
  return includeLibsStream(libs.plugins)
    .pipe(gulp.dest('wiki/plugins'));
});

gulp.task('babel-scripts', function() {
  return gulp.src('scripts/**/*.js')
    .pipe(babel(babelrc))
    .pipe(gulp.dest('public/scripts'));
});

gulp.task('files-scripts', function() {
  return gulp.src(['scripts/**/*.*', '!**/*.js'])
    .pipe(gulp.dest('public/scripts'));
});

gulp.task('script-libraries', function() {
  return includeLibsStream(libs.scripts)
    .pipe(gulp.dest('public/scripts'));
});

gulp.task('themes', function() {
  return gulp.src('themes/*')
    .pipe(gulp.dest('wiki/themes'));
});

gulp.task('tiddlers', function() {
  return assertWikiDir().then(function() {
    try {
      fs.statSync('wiki/tiddlers');
      debug('wiki/tiddlers exist, skipping symlink');
      return;
    } catch(e) {
      debug('wiki/tiddlers missing, creating symlink');
      return fs.symlinkAsync('../tiddlers', 'wiki/tiddlers');
    }
  });
});

gulp.task('plugins', ['babel-plugins', 'files-plugins', 'plugin-libraries']);

gulp.task('scripts', ['babel-scripts', 'files-scripts', 'script-libraries']);

gulp.task('tiddlywiki', ['config-production', 'themes', 'plugins', 'tiddlers'], function() {
  var args = 'wiki --build index favicon static'.split(' ');
  return waitForProcess(spawnProcess('./node_modules/.bin/tiddlywiki', args));
});

gulp.task('server', ['config-development', 'themes', 'plugins', 'tiddlers'], function() {
  if (runningProcess) {
    debug('Restarting currently running server…');
    runningProcess.kill('SIGINT');
  }
  runningProcess = spawnProcess('./node_modules/.bin/tiddlywiki', ['wiki', '--server', '', '', '', '', '', '', '0.0.0.0']);
  return Promise.delay(800).then(function() { livereload.reload(); });
});

gulp.task('watch', ['server'], function() {
  livereload.listen();
  debug('Live Reload server started');
  gulp.watch(['plugins/**/*', 'themes/**/*', 'config/**/*'], ['server']);
});

gulp.task('build', ['tiddlywiki', 'scripts'], function() {
  return gulp.src(['public/**/*', 'public/.htaccess']).pipe(gulp.dest('wiki/output'));
});

gulp.task('prepare-wiki', ['config-development', 'themes', 'plugins', 'tiddlers']);

gulp.task('clean', function() {
  return del(['wiki', 'public/scripts']);
});

gulp.task('default', ['build']);

process.on('SIGEXIT', function() {
  if (runningProcess) {
    runningProcess.kill('SIGINT');
  }
  process.exit(0);
});
