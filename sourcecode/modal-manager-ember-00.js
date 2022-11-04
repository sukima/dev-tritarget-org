class ModalManager {
  @tracked isOpen = false;
  #resolve = () => {};
  #reject = () => {};

  @action
  open() {
    return new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    }).finally(() => {
      this.isOpen = false;
    });
  }

  @action cancel() { … }
  @action confirm(value) { … }
  @action reject(value) { … }
  @action error(error) { … }
}
