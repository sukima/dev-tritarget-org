function uniqueLines() {
  let lines = new Set();
  return new Transform({
    objectMode: true,
    transform(line, _, done) {
      lines.add(line);
      done();
    },
    flush(done) {
      lines.forEach((line) => this.push(line));
      done();
    },
  });
}
