#handleSubmit = (event) =>
  this.#confirm(new FormData(event.target));
…
this.element.addEventListener('submit', this.#handleSubmit);
