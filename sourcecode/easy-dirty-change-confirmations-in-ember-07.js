class UnloadManager {
  @tracked hasChanges = false;
  confirmationModal = new ModalManager();

  get showConfirmation() {
    return this.confirmationModal.isOpen;
  }

  @action
  async confirmAbandonChanges() {
    let result = await this.confirmationModal.open();
    if (result.reason === 'confirmed') {
      this.resetChanges();
    }
    return result;
  }

  …
}
