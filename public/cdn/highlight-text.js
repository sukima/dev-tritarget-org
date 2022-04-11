const { SHOW_TEXT, FILTER_ACCEPT, FILTER_SKIP } = NodeFilter;
const keepOrNot = (bool) => bool ? FILTER_ACCEPT : FILTER_SKIP;
const filterFrom = (maybeFilter) => typeof maybeFilter === 'string'
  ? new RegExp(`\\b${maybeFilter}\\b`)
  : maybeFilter;

/**
 * Wrap partial text nodes with <mark></mark> tags.
 *
 * @example
 * ```js
 * // <p>this is an example text.</p>
 * let marks = highlightText('example');
 * for (let mark of marks) console.dir(mark);
 * marks.size; // => 1
 * marks.removeAll();
 * marks.size; // => 0
 * ```
 */
export function highlightText(maybeFilter, root = document.body) {
  const nodeFilter = (n) => keepOrNot(!visited.has(n) && filter.test(n.data));
  let node;
  let marks = new Set();
  let visited = new WeakSet();
  let range = document.createRange();
  let filter = filterFrom(maybeFilter);
  let nodeIterator = document.createNodeIterator(root, SHOW_TEXT, nodeFilter);

  while (node = nodeIterator.nextNode()) {
    let mark = document.createElement('mark');
    let match = node.data.match(filter);
    let { index: firstSplitOffset } = match;
    let { length: secondSplitOffset } = match[0];
    let splitNode = firstSplitOffset > 0
      ? node.splitText(firstSplitOffset)
      : node;

    if (splitNode.data.length > secondSplitOffset) {
      splitNode.splitText(secondSplitOffset);
    }

    range.selectNode(splitNode);
    range.surroundContents(mark);
    visited.add(splitNode);
    marks.add(mark);
  }

  return {
    removeAll() {
      for (let mark of marks) {
        let parent = mark.parentNode;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
      }
      marks.clear();
    },
    get size() {
      return marks.size;
    },
    [Symbol.iterator]() {
      return marks.values();
    }
  };
}
