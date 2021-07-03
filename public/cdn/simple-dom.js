const proxies = new WeakSet();

function attachEvents(el, eventNames, fn, options) {
  eventNames.forEach((e) => el.addEventListener(e, fn, options));
  return () =>
    eventNames.forEach((e) => el.removeEventListener(e, fn, options));
}

function eventable(...elements) {
  return new Proxy({}, {
    get(_, prop) {
      let eventNames = prop.split(',');
      return (fn, options) => {
        let detachables = elements.map(
          e => attachEvents(e, eventNames, fn, options)
        );
        return () => detachables.forEach(i => i());
      };
    },
  });
}

function wrapper(fn) {
  return subject => {
    if (proxies.has(subject)) { return subject; }
    let result = fn(subject);
    proxies.add(result);
    return result;
  };
}

function domAll(element) {
  const queryWrap = wrapper(prop => {
    return new Proxy([...element.querySelectorAll(prop)].map(dom), {
      get(target, prop) {
        switch (prop) {
          case 'elements': return target.map(i => i.element);
          case 'on': return eventable(...target.map(i => i.element));
        }
        return Reflect.get(target, prop);
      },
      set(target, prop, value) {
        return Reflect.set(target, prop, value);
      },
    });
  });

  return wrapper(() => new Proxy(queryWrap, {
    get(_, prop) {
      return queryWrap(prop);
    },
  }))();
}

function dom(element) {
  const queryWrap = wrapper(prop => {
    return prop instanceof Node
      ? dom(prop)
      : dom(element.querySelector(prop) ?? document.getElementById(prop));
  });

  return wrapper(() => new Proxy(queryWrap, {
    get(_, prop) {
      switch (prop) {
        case 'element': return element;
        case 'all': return domAll(element);
        case 'on':
          return eventable(element === document ? document.body : element);
      }
      if (Reflect.has(element, prop)) {
        let thing = Reflect.get(element, prop);
        return typeof thing === 'function'
          ? (...args) => thing.call(element, ...args)
          : thing;
      }
      return queryWrap(prop);
    },
    set(_, prop, value) {
      return Reflect.set(element, prop, value);
    },
  }))();
}

export default dom(document);
