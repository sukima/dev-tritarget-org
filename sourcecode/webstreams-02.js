let reader = file
  .stream()
  .pipeThrough(new TextDecoderStream());
