class LineRenderer {
  buffer = [];
  constructor({ batchSize = 1 } = {}) { … }
  queueLine(line) {
    this.buffer.push(line);
    if (this.buffer.length < this.batchSize) return;
    renderLines(this.buffer);
    this.buffer = [];
    return new Promise(
      resolve => setTimeout(resolve, 100),
    );
  }
  flushLines() { … }
  stream() {
    return new WritableStream({ … });
  }
}
