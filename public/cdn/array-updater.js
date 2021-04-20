const elementData = new WeakMap();

export function dataUpdater({ query, append, render, remove }) {
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
      } else if (elementData.get(elements[i]) !== data[i]) {
        toBeUpdated.push([i, data[i]]);
      }
    }
    toBeUpdated.forEach(([i, d]) => update(elements[i], d, i));
    toBeDeleted.forEach((i, j) => remove(i - j));
    toBeAppended.forEach((d) => update(append(), d, -1));
  };
}

export function tableUpdater(elementWithRows, render) {
  let element = elementWithRows.tBodies?.[0] ?? elementWithRows;
  return dataUpdater({
    render,
    query: () => element.rows,
    append: () => element.insertRow(-1),
    remove: i => element.deleteRow(i),
  });
}

export function listUpdater(listElement, render) {
  return dataUpdater({
    render,
    query: () => listElement.childNodes,
    append: () => listElement.appendChild(document.createElement('li')),
    remove: i => listElement.childNodes[i].remove(),
  });
}
