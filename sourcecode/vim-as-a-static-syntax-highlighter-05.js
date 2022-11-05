function convertIdsToClassNames() {
  const idMatcher = /id=['"]([^'"]*)['"]/g;
  let firstLine = true;
  return new Transform({
    objectMode: true,
    transform(line, _, done) {
      if (firstLine) {
        firstLine = false;
        this.push(line.replace(idMatcher, 'class="$1"'));
      } else {
        this.push(line);
      }
      done();
    }
  });
}
