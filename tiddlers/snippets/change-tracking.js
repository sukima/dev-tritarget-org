const references = new WeakMap();
const trackedChanges = new WeakMap();

export function trackChanges(obj) {
  return new Proxy(obj, {
    get(target, prop) { return Reflect.get(target, prop); },
    set(target, prop, value) {
      let changes = trackedChanges.get(target) ?? new Map();
      if (changes.get(prop) === value) {
        changes.delete(prop);
      } else if (!changes.has(prop)) {
        changes.set(prop, Reflect.get(target, prop));
      }
      trackedChanges.set(target, changes);
      return Reflect.set(target, prop, value);
    }
  });
}

export function changeSummary(obj) {
  let reference = references.get(obj) ?? obj;
  let changes = trackedChanges.get(references) ?? new Map();
  return [...changes].map(([prop, from]) => {
    return { prop, from, to: reference[prop] };
  });
}
