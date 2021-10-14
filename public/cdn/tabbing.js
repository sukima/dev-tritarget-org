const tabIndexes = new WeakMap();

function* tabableElements(
  selectAll = (selector) => document.querySelectorAll(selector)
) {
  yield* selectAll('a[href]');
  yield* selectAll('button');
  yield* selectAll('select');
  yield* selectAll('textarea');
  yield* selectAll('input:not([type=hidden])');
  yield* selectAll('[contenteditable]');
}

export function confineTabbing(container, selectAll) {
  for (let element of tabableElements(selectAll)) {
    tabIndexes.set(element, element.tabIndex);
    if (!container.contains(element)) {
      element.tabIndex = -1;
    }
  }
}

export function releaseTabbing(selectAll) {
  for (let element of tabableElements(selectAll)) {
    element.tabIndex = tabIndexes.get(element) || 0;
  }
}
