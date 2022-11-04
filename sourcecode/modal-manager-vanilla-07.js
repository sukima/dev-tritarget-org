#handleClick = (event) => {
  let value =
    event.target.dataset.value
    ?? this.element.returnValue;
  switch (event.target.dataset.action) {
    case 'cancel': return this.#cancel();
    case 'confirm': return this.#confirm(value);
    case 'reject': return this.#reject(value);
    default: // no-op
  }
};
…
this.element.addEventListener('click', this.#handleClick);
