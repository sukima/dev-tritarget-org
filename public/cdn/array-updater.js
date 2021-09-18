/**
 * Utility to manage a set of callbacks based on the changes to an array.
 * Specifically this utility will keep track of an artray's data/elements. Each
 * time the data updates calling this utility will compare the previous values
 * and call the callbacks for the necessary actions insert, update, and remove.
 * A render function is called for each action. Common use case is building DOM
 * nodes based on an array of data.
 *
 * @example
 * let divUpdater = dataUpdater({
 *   render: (element, item) => { element.textContent = item.label },
 *   query: () => document.querySelectorAll('div'),
 *   append: () => document.body.appendChild(document.createElement('div')),
 *   remove: (index) => [...document.querySelectorAll('div')][index].remove(),
 *   matcher: (a, b) => a.label === b.label,
 * });
 * divUpdater([{ label: 'foo' }, { label: 'bar' }, { label: 'baz' }]);
 * divUpdater([{ label: 'foo' }, { label: 'bar' }]);
 * divUpdater([{ label: 'foo' }, { label: 'baz' }]);
 * divUpdater([{ label: 'foo' }, { label: 'baz' }, { label: 'frotz' }]);
 *
 * @module array-updater
 */
const elementData = new WeakMap();

export function dataUpdater({
  query,
  append,
  render,
  remove,
  matcher = (a, b) => a === b,
}) {
  let update = (e, d, i) => elementData.set(render(e, d, i) ?? e, d);
  return (data) => {
    let elements = [...query()];
    let size = Math.max(elements.length, data.length);
    let toBeDeleted = [];
    let toBeUpdated = [];
    let toBeAppended = [];
    for (let i = 0; i < size; i++) {
      if (i >= elements.length) {
        toBeAppended.push(data[i]);
      } else if (i >= data.length) {
        toBeDeleted.push(i);
      } else if (!matcher(elementData.get(elements[i]), data[i])) {
        toBeUpdated.push([i, data[i]]);
      }
    }
    toBeUpdated.forEach(([i, d]) => update(elements[i], d, i));
    toBeDeleted.forEach((i, j) => remove(i - j));
    toBeAppended.forEach((d) => update(append(), d, -1));
    return data;
  };
}

/** Specific updater for working with DOM tables */
export function tableUpdater(elementWithRows, render, { matcher } = {}) {
  let element = elementWithRows.tBodies?.[0] ?? elementWithRows;
  return dataUpdater({
    render,
    matcher,
    query: () => element.rows,
    append: () => element.insertRow(-1),
    remove: i => element.deleteRow(i),
  });
}

/** Specific updater for working with DOM lists */
export function listUpdater(listElement, render, { matcher } = {}) {
  return dataUpdater({
    render,
    matcher,
    query: () => listElement.childNodes,
    append: () => listElement.appendChild(document.createElement('li')),
    remove: i => listElement.childNodes[i].remove(),
  });
}
