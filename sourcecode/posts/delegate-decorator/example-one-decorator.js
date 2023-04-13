class Decorator {
  #model;
  constructor(legacyModel) {
    this.#model = legacyModel;
  }
  get firstName() {
    return this.#model.name.split(' ')[0];
  }
  get lastName() {
    return this.#model.name.split(' ')[1];
  }
  static wrap(legacyModel) {
    let decorator = new Decorator(legacyModel);
    return new Proxy(legacyModel, {
      get(_, prop) {
        let target = Reflect.has(decorator, prop)
          ? decorator
          : legacyModel;
        let value = Reflect.get(target, prop);
        return typeof value === 'function'
          ? value.bind(target)
          : value;
      }
    });
  }
}

// And the new system will use it like this:
let legacyModel = await LegacyModel.fetch('bada55');
let model = Decorator.wrap(legacyModel);
console.log(
  '%s: Hello %s, with a last name of %s.',
  model.id,
  model.firstName,
  model.lastName,
);
