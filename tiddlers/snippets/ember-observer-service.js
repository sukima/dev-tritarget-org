import Service from '@ember/service';

const observers = new Set();
const subscribers = new WeakMap();

export default class MyObserver extends Service {
  subscribe(key, callback) {
    let callbacks = subscribers.get(key) ?? new Set();
    callbacks.add(callback);
    observers.add(callbacks);
    subscribers.set(key, callbacks);
  }

  unsubscribe(key) {
    let callbacks = subscribers.get(key);
    observers.delete(callbacks);
    subscribers.delete(key);
  }

  notify() {
    observers.forEach(ob => ob.forEach(cb => cb()));
  }
}
