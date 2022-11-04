let beforeUnloadEnabled = true;

export function disableBeforeunload() {
  beforeUnloadEnabled = false;
}

export enableBeforeunload() {
  beforeUnloadEnabled = true;
}

…
  @action
  registerChanges() {
    if (beforeUnloadEnabled) {
      window.addEventListener(
        'beforeunload',
        this.beforeunload
      );
    }
    this.hasChanges = true;
  }
