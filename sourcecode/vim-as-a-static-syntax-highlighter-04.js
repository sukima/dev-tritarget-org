function filterHtmlBody() {
  let isBody = false;
  return new Transform({
    objectMode: true,
    transform(line, _, done) {
      if (line.startsWith('<body')) {
        isBody = true;
      } else if (line.startsWith('</body>')) {
        isBody = false;
      } else if (isBody) {
        this.push(line);
      }
      done();
    },
  });
}
