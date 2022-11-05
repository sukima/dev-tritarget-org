function joinLines() {
  return new Transform({
    objectMode: true,
    transform(line, _, done) {
      this.push(`${line}\n`);
      done();
    },
  });
}
