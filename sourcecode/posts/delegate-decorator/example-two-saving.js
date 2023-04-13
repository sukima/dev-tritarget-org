class Decorator {
  …
  async save() {
    await Promise.all(this.#saveChanges());
    this.#changes.reset();
  }
  *#saveChanges() {
    let { isDirty } = this.#changes;
    if (isDirty.base) yield this.#baseInfo.save();
    if (isDirty.extra) yield this.#extraInfo.save();
  }
  …
}
