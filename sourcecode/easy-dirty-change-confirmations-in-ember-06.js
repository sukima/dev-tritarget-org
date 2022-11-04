class ModalManager {
  #resolve = () => {};
  @tracked isOpen = false;

  @action
  open() {
    return new Promise((resolve) => {
      this.#resolve = resolve;
      this.isOpen = true;
    }).finally(() => this.isOpen = false);
  }

  @action
  confirm(value) {
    this.#resolve({ reason: 'confirmed', value });
  }

  @action
  cancel(value) {
    this.#resolve({ reason: 'cancelled', value });
  }
}
