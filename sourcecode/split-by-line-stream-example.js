const { Transform } = require('node:stream');

function splitByLines() { … }

function exampleTally() {
  let lineCount = 0;
  return new Transform({
    objectMode: true,
    transform(line, _, done) {
      lineCount++;
      done();
    },
    flush(done) {
      this.push(`Line count: ${lineCount}\n`);
      done();
    },
  });
}

process.stdin
  .pipe(splitByLines())
  .pipe(exampleTally())
  .pipe(process.stdout);
