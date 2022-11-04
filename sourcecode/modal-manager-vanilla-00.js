class ModalManager {
  isOpen = false;
  #openModal = () => {};
  #closeModal = () => {};
  #resolve = () => {};
  #reject = () => {};

  open() {
    return new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
      this.#openModal();
      this.isOpen = true;
    }).finally(() => {
      this.isOpen = false;
      this.#closeModal();
    });
  }

  cancel() { … }
  confirm(value) { … }
  reject(value) { … }
  error(error) { … }

  delegateTo(controller) {
    this.#openModal = () => controller.open();
    this.#closeModal = () => controller.close();
  }
}
