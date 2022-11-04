let manager = new ModalManager();
let controller = new ModalDialogController(
  document.querySelector('dialog'),
  manager,
);
manager.delegateTo(controller);
let { reason } = await manager.open();
