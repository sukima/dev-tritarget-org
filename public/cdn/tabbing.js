const tabIndexes = new WeakMap();

function* tabableElements(
  selectAll = s => document.querySelectorAll(s)
) {
  yield* selectAll('a[href]');
  yield* selectAll('button');
  yield* selectAll('select');
  yield* selectAll('textarea');
  yield* selectAll('input:not([type=hidden])');
  yield* selectAll('[contenteditable]');
}

export function confineTabbing(container, selectAll) {
  [...tabableElements(selectAll)].forEach(i => {
    tabIndexes.set(i, i.tabIndex);
    if (!container.contains(i)) {
      i.tabIndex = -1;
    }
  });
}

export function releaseTabbing(selectAll) {
  [...tabableElements(selectAll)]
    .forEach(i => i.tabIndex = tabIndexes.get(i) || 0);
}
