class LineGuardError extends Error {
  name = 'LineGuardError';
  constructor(lines) {
    super(`Exceeded max lines (${lines}). File truncated`);
  }
}

class LineGuard {
  lineCount = 0;
  constructor(columns, lines) {
    this.columns = columns;
    this.lines = lines;
  }
  processLine(line, controller) {
    this.lineCount++;
    if (this.lineCount > this.lines)
      throw new LineGuardError(this.lines);
    controller.enqueue(line.slice(0, this.columns));
  }
  stream() {
    return new TransformStream({
      transform: (chunk, controller) =>
        this.processLine(chunk, controller),
    });
  }
}

file
  .stream()
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new LineChunks().stream())
  .pipeThrough(new LineGuard(80, 24).stream())
  .pipeTo(new LineRenderer({ batchSize: 50 }).stream());
