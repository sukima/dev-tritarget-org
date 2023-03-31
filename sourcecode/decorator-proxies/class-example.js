class Decorator {
  get bar() {
    return 'BAR';
  }

  static wrap(subject) {
    let decorator = new Decorator();
    return new Proxy(subject, {
      get(_, prop) {
        let target = Reflect.has(decorator, prop)
          ? decorator
          : subject;
        let value = Reflect.get(target, prop);
        return typeof value === 'function'
          ? value.bind(target)
          : value;
      }
    });
  }
}

let foo = { foo: 'FOO' };
let baz = Decorator.wrap(foo);

baz.foo; // => "FOO"
baz.bar; // => "BAR"
