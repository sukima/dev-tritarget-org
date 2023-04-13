class DirtyTracker {
  static BASE = 1 << 0;
  static EXTRA = 1 << 1;
  changes = 0;
  base() {
    this.changes |= DirtyTracker.BASE;
  }
  extra() {
    this.changes |= DirtyTracker.EXTRA;
  }
  reset() {
    this.changes = 0;
  }
  get isDirty() {
    return {
      base: this.changes & DirtyTracker.BASE,
      extra: this.changes & DirtyTracker.EXTRA,
    };
  }
}
