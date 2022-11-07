function splitByLines() { … }

function consoleLogWriter() {
  let counter = 0;
  return new WriteableStream({
    write(line) {
      console.log(counter++, line);
    },
  });
}

file
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(splitByLines())
  .pipeTo(consoleLogWriter());
