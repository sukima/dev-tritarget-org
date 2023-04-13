class Decorator {
  #baseInfo;
  #extraInfo;
  #changes = new DirtyTracker();
  constructor(baseInfo, extraInfo) {
    this.#baseInfo = baseInfo;
    this.#extraInfo = extraInfo;
  }
  get title() {
    return this.#titleParts()[0];
  }
  set title(title) {
    return this.#setName({ title });
  }
  get year() {
    return Number(this.#titleParts()[1]);
  }
  set year(year) {
    return this.#setName({ year });
  }
  async save() {
    await Promise.all(this.#saveChanges());
    this.#changes.reset();
  }
  #titleParts() {
    let [, ...parts] =
      /^(.+)\s+\((\d{4})\)$/.exec(this.#baseInfo.name);
    return parts;
  }
  #setName({ title = this.title, year = this.year }) {
    this.#changes.base();
    return this.#baseInfo.name = `${title} (${year})`;
  }
  *#saveChanges() {
    let { isDirty } = this.#changes;
    if (isDirty.base) yield this.#baseInfo.save();
    if (isDirty.extra) yield this.#extraInfo.save();
  }
  static wrap(baseInfo, extraInfo) {
    let decorator = new Decorator(baseInfo, extraInfo);
    return new Proxy(baseInfo, {
      get(_, prop) {
        const maybe = (target) =>
          Reflect.has(target, prop) ? target : null;
        let target = maybe(decorator)
          ?? maybe(extraInfo)
          ?? baseInfo;
        let value = Reflect.get(target, prop);
        return typeof value === 'function'
          ? value.bind(target)
          : value;
      },
      set(_, prop, value) {
        const maybe = (target) =>
          Reflect.has(target, prop) ? target : null;
        let target = maybe(decorator)
          ?? maybe(extraInfo)
          ?? baseInfo;
        if (target === baseInfo)
          decorator.#changes.base();
        if (target === extraInfo)
          decorator.#changes.extra();
        return Reflect.set(target, prop, value);
      },
    });
  }
}
