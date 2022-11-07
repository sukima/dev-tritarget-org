class CustomConsoleWriter {
  counter = 0;
  stream() {
    return new WriteableStream({
      write: (data) =>
        console.log(this.counter++, data),
    });
  }
}

file
  .stream()
  .pipeThrough(new TextDecoderStream())
  .pipeTo(new CustomConsoleWriter().stream());
