class UnloadManager {
  @tracked hasChanges = false;

  @action
  registerChanges() {
    window.addEventListener(
      'beforeunload',
      this.beforeunload
    );
    this.hasChanges = true;
  }

  @action
  resetChanges() {
    window.removeEventListener(
      'beforeunload',
      this.beforeunload
    );
    this.hasChanges = false;
  }

  @action
  beforeunload(event) {
    event.preventDefault(); // FireFox
    event.returnValue = true; // Chrome
    return 'true'; // Safari
  }
}
