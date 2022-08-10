const tabIndexes = new WeakMap();

function* findTabableElements(
  selectAll = (selector) => document.querySelectorAll(selector)
) {
  yield* selectAll('a[href]');
  yield* selectAll('area[href]');
  yield* selectAll('input:not([disabled])');
  yield* selectAll('select:not([disabled])');
  yield* selectAll('textarea:not([disabled])');
  yield* selectAll('button:not([disabled])');
  yield* selectAll('iframe');
  yield* selectAll('object');
  yield* selectAll('embed');
  yield* selectAll('*[tabindex]');
  yield* selectAll('*[contenteditable]');
}

export function confineTabbing(container, selectAll) {
  let firstElementWithin = null;
  let tabableElements = new Set(findTabableElements(selectAll));
  for (let element of tabableElements) {
    tabIndexes.set(element, element.tabIndex);
    if (container.contains(element)) {
      firstElementWithin ??= element;
    } else {
      element.tabIndex = -1;
    }
  }
  return firstElementWithin;
}

export function releaseTabbing(selectAll) {
  let tabableElements = new Set(findTabableElements(selectAll));
  for (let element of tabableElements) {
    element.tabIndex = tabIndexes.get(element) || 0;
  }
}
