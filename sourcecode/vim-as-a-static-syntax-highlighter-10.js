function filterCssRules() {
  let isStyle = false;
  return new Transform({
    objectMode: true,
    transform(line, _, done) {
      if (line.startsWith('<style>')) {
        isStyle = true;
      } else if (line.startsWith('</style>')) {
        isStyle = false;
      } else if (isStyle && line.startsWith('.')) {
        this.push(line);
      }
      done();
    },
  });
}
