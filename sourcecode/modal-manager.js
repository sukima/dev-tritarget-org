class ModalManager {
  #resolve = () => {};
  #reject = () => {};
  isOpen = false;
  open() {
    return new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
      this.isOpen = true;
    }).finally(() => (this.isOpen = false));
  }
  cancel() {
    this.#resolve({ reason: 'cancelled' });
  }
  confirm(value) {
    this.#resolve({ reason: 'confirmed', value });
  }
  reject(value) {
    this.#resolve({ reason: 'confirmed', value });
  }
  error(error) {
    this.#reject(error);
  }
}
