class UnloadManager {
  @tracked hasChanges = false;

  @action
  registerChanges() {
    this.hasChanges = true;
  }

  @action
  resetChanges() {
    this.hasChanges = false;
  }
}
