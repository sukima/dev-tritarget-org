function splitByLines() {
  let buffer = '';
  return new Transform({
    objectMode: true,
    transform(chunk, _, done) {
      for (let char of chunk.toString()) {
        if (char === '\r') continue;
        if (char === '\n') {
          this.push(buffer);
          buffer = '';
          continue;
        }
        buffer += char;
      }
      done();
    },
    flush(done) {
      if (buffer !== '') this.push(buffer);
      done();
    },
  });
}
