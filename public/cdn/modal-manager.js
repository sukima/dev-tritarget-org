/**
 * A convenient and promise-based manager of modals. It couples opening and
 * closing of a dialog to a promise result. This allows any dialog controller
 * to manage the logistics of opening and closing while the application code
 * can rely on the async nature of the manager to handle the control flow.
 *
 * the result of the promise will be a tuple object with a reason and a value
 * property. The possible reasons are 'confirmed', 'cancelled', and 'rejected'.
 *
 * @example
 * ```javascript
 * let manager = new ModalManager();
 * let { reason, value } = await manager.open();
 * if (reason === 'confirmed') { … }
 * ```
 *
 * A dialog element controller is provided by default through the factory
 * `ModalManager.for()`
 *
 * @example
 * ```html
 * <dialog id="my-modal">…</dialog>
 * ```
 *
 * ```javascript
 * let manager = ModalManager.for(document.getElementById('my-modal'));
 * let { reason, value } = await manager.open();
 * if (reason === 'confirmed') { … }
 * ```
 */
export default class ModalManager {
  isOpen = false;
  #resolve = () => {};
  #reject = () => {};
  #openModal = () => {};
  #closeModal = () => {};

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

  cancel() {
    this.#resolve({ reason: 'cancelled' });
  }

  confirm(value) {
    this.#resolve({ reason: 'confirmed', value });
  }

  reject(value) {
    this.#resolve({ reason: 'rejected', value });
  }

  error(error) {
    this.#reject(error);
  }

  delegateTo(controller) {
    this.#openModal = () => controller.open();
    this.#closeModal = () => controller.close();
  }

  static for(
    element,
    delegateFactory = (element, manager) =>
      new ModalDialogController(element, manager),
  ) {
    let manager = new ModalManager();
    manager.delegateTo(delegateFactory(element, manager));
    return manager;
  }
}

export class ModalDialogController {
  #cancel = () => this.manager.cancel();
  #confirm = (value) => this.manager.confirm(value);
  #reject = (value) => this.manager.reject(value);
  #confirmForm = (event) => this.#confirm(new FormData(event.target));
  #handleAction = (event) => {
    if (this.element === event.target) return this.#cancel();
    let returnValue = event.target.dataset.value ?? this.element.returnValue;
    switch (event.target.dataset.action) {
      case 'cancel': return this.#cancel();
      case 'confirm': return this.#confirm(returnValue);
      case 'reject': return this.#reject(returnValue);
      default: // no-op
    }
  };

  constructor(element, manager) {
    this.element = element;
    this.manager = manager;
  }

  open() {
    this.setupEvents();
    this.showElement();
  }

  close() {
    this.removeEvents();
    this.hideElement();
  }

  /* == Hooks available for extending == */

  setupEvents() {
    this.element.addEventListener('click', this.#handleAction);
    this.element.addEventListener('cancel', this.#cancel);
    this.element.addEventListener('submit', this.#confirmForm);
  }

  removeEvents() {
    this.element.removeEventListener('click', this.#handleAction);
    this.element.removeEventListener('cancel', this.#cancel);
    this.element.removeEventListener('submit', this.#confirmForm);
  }

  showElement() {
    this.element.showModal();
  }

  hideElement() {
    this.element.close();
  }
}
