function prependPreambleLines() {
  let sentPreamble = false;
  return new Transform({
    objectMode: true,
    transform(line, _, done) {
      if (!sentPreamble) {
        sentPreamble = true;
        this.push('/*\\');
        this.push('title: $:/site/sourcecode/styles.css');
        this.push('tags: $:/tags/Stylesheet');
        this.push('type: text/css');
        this.push('\\*/');
      }
      this.push(line);
      done();
    },
  });
}
