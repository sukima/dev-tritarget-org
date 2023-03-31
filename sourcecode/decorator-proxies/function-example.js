function decorate(subject, decorator) {
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

let foo = { foo: 'FOO' };
let bar = { bar: 'BAR' };
let baz = decorate(foo, bar);

baz.foo; // => "FOO"
baz.bar; // => "BAR"
