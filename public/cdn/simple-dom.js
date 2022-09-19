/*******************************************/
/* Version 1.1.0                           */
/* License MIT                             */
/* Copyright (C) 2022 Devin Weaver         */
/* https://tritarget.org/cdn/simple-dom.js */
/*******************************************/

/**
 * This micro lib is a compact and simple method to interact with the DOM. It
 * facilitates the query mechanisms that querySelector and querySelectorAll use
 * but in a compact fluent API. It also makes adding (and removing) events
 * easy.
 *
 * Tests: https://tritarget.org/cdn/tests/simple-dom-test.js
 *
 * ## Query single element
 *
 * Queries are performed by property lookups. It will use querySelector()
 * first. If that doesn't find anything it will default to getElementById().
 *
 * Calling methods/properties on the Element will be proxied. If however you
 * need access to the actual Element use `.element`.
 *
 * @example
 * ```js
 * import $ from 'https://tritarget.org/cdn/simple-dom.js';
 *
 * // By ID
 * $.anElementId.dataset.foo;
 * $['#anElementId']dataset.foo;
 *
 * // By CSS selection
 * $['.foobar'].classList.add('list-item');
 * $['ul li'].classList.add('first-list-item');
 * $['button[data-action]'].on.click(() => console.count('button action'));
 * doSomethingWithRawElement($.foobar.element);
 * ```
 *
 * ## Query many elements
 *
 * Selecting multiple can be opt-in with the `.all` property.
 *
 * Calling methods/properties on the NodeList will be proxied. If however you
 * need access to the actual NodeList use `.elements`.
 *
 * @example
 * ```js
 * $.all['ul li'].classList.add('list-item');
 * $.all['button'].on.click(() => { … });
 * doSomethingWithRawNodeList($.all['.foobar'].elements);
 * ```
 *
 * ## Events
 *
 * Events can be attach with the `.on` property followed by the event name as
 * a function with the callback passed in. When attaching events it will return
 * a teardown function.
 *
 * @example
 * ```js
 * let off = $.on.keyup(() => { … });
 * off();
 *
 * $.button.on.click(() => { … });
 * $.all['.btn'].on.customEvent(() => { … });
 * ```
 *
 * ## Creation
 *
 * Just because the typical createElement procedures can be a little tedius.
 *
 * @example
 * ```js
 * $.new.div({ class: 'foo bar' });
 * $.new.div({ text: 'foobar' });
 * $.new.div({ text: 'foobar' });
 * ```
 */

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

function elementCreaterFor(tag) {
  return function createElement(configs = {}) {
    let element = document.createElement(tag);
    for (let [key, value] of Object.entries(configs)) {
      switch (key) {
        case 'classes':
          element.classList.add(...value);
          break;
        case 'class':
          element.className = value;
          break;
        case 'data':
          Object.assign(element.dataset, value);
          break;
        case 'attrs':
          Object.entries(value).forEach(([k, v]) => element.setAttribute(k, v));
          break;
        case 'text':
          element.textContent = value;
          break;
        case 'html':
          element.innerHTML = value;
          break;
        default:
          element[key] = value;
      }
    }
    return element;
  }
}

function creatable() {
  return new Proxy({}, {
    get(_, prop) {
      return elementCreaterFor(prop);
    },
  });
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
        case 'new': return creatable();
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
