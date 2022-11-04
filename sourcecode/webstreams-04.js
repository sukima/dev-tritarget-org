class LineChunks {
  buffer = '';
  flushBuffer(controller) {
    if (this.buffer === '') return;
    controller.enqueue(this.buffer);
  }
  processChunk(chunk, controller) {
    this.buffer += chunk;
    let lines = this.buffer.split('\n');
    while (lines.length > 1)
      controller.enqueue(lines.shift());
    this.buffer = lines[0];
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
