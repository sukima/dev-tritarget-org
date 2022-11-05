function prependPreambleLines() {
  let sentPreamble = false;
  return new Transform({
    objectMode: true,
    transform(line, _, done) {
      if (!sentPreamble) {
        sentPreamble = true;
        this.push(
          `title: sourcecode/${process.env.SOURCE_FILE}`
        );
        this.push('type: text/prs.sourcecode');
        this.push('');
      }
      this.push(line);
      done();
    },
  });
}
