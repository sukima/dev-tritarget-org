class LineChunks {
  buffer = '';
  flushBuffer(controller) {
    if (this.buffer === '') return;
    controller.enqueue(this.buffer);
  }
  processChunk(chunk, controller) {
    for (let char of chunk) {
      if (char === '\r') continue;
      if (char === '\n') {
        controller.enqueue(this.buffer);
        this.buffer = '';
        continue;
      }
      buffer += char;
    }
  }
  stream() {
    return new TransformStream({
      transform: (chunk, controller) =>
        this.processChunk(chunk, controller),
      flush: (controller) =>
        this.flushBuffer(controller),
    });
  }
}

file
  .stream()
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new LineChunks().stream())
  .pipeTo(new CustomConsoleWriter().stream());
