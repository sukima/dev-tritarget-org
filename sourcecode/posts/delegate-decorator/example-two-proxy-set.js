class Decorator {
  …
  static wrap(baseInfo, extraInfo) {
    let decorator = new Decorator(baseInfo, extraInfo);
    return new Proxy(baseInfo, {
      get(_, prop) { … },
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
