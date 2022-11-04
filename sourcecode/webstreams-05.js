class LineRenderer {
  buffer = [];
  constructor({ batchSize = 1 } = {}) {
    this.batchSize = batchSize;
  }
  queueLine(line) {
    this.buffer.push(line);
    if (this.buffer.length < batchSize) return;
    renderLines(this.buffer);
    this.buffer = [];
  }
  flushLines() {
    if (this.buffer.length === 0) return;
    renderLines(this.buffer);
  }
  stream() {
    return new WritableStream({
      write: (chunk) => this.queueLine(chunk),
      close: () => this.flushLines(),
    });
  }
}

file
  .stream()
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new LineChunks().stream())
  .pipeTo(new LineRenderer({ batchSize: 50 }).stream());
