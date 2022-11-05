process.stdin
  .pipe(splitByLines())
  .pipe(filterCssRules())
  .pipe(uniqueLines())
  .pipe(prepareCssRule())
  .pipe(prependPreambleLines())
  .pipe(joinLines())
  .pipe(process.stdout);
