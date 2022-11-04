class ModalDialogController {
  constructor(element, manager) {
    this.element = element;
    this.manager = manager;
  }

  open() {
    // … attach event listeners here …
    this.element.showModal();
  }

  close() {
    // … remove event listeners here …
    this.element.close();
  }
}
