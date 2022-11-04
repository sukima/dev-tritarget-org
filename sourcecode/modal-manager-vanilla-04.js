class ModalDialogController {
  #cancel = () => this.manager.cancel();
  #confirm = (value) => this.manager.confirm(value);
  #reject = (value) => this.manager.reject(value);
  …
}
