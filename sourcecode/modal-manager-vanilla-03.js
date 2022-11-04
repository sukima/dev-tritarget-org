// Factory function
static for(
  element,
  factory = (element, manager) =>
    new ModalDialogController(element, manager),
) {
  let manager = new ModalManager();
  manager.delegateTo(factory(element, manager));
  return manager;
}
…
let myManager = ModalManager.for(
  document.querySelector('dialog'),
);
