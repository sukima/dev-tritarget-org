process.stdin
  .pipe(splitByLines())
  .pipe(filterHtmlBody())
  .pipe(convertIdsToClassNames())
  .pipe(prependPreambleLines())
  .pipe(joinLines())
  .pipe(process.stdout);
