function splitByLines() {
  let buffer = '';
  return new TransformStream({
    transform(chunk, controller) {
      for (let char of chunk) {
        if (char === '\r') continue;
        if (char === '\n') {
          controller.enqueue(buffer);
          buffer = '';
          continue;
        }
        buffer += char;
      }
    },
    flush(controller) {
      if (buffer === '') return;
      controller.enqueue(buffer);
    },
  });
}
