function prepareCssRule() {
  return new Transform({
    objectMode: true,
    transform(line, _, done) {
      for (let colorTransform of colorTransforms) {
        let [colorMatcher, replacement] = colorTransform;
        line = line.replace(colorMatcher, replacement);
      }
      this.push(`.vimCodeElement ${line}`);
      done();
    },
  });
}
