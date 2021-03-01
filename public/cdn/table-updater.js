const tableData = new WeakMap();

export function tableUpdater(elementWithRows, rerenderRow) {
  let update = (r, d, i) => tableData.set(rerenderRow(r, d, i, element) ?? r, d);
  let element = elementWithRows.tBodies?.[0] ?? elementWithRows;
  return (data) => {
    let rows = [...element.rows];
    let size = Math.max(rows.length, data.length);
    let toBeDeleted = [];
    let toBeUpdated = [];
    let toBeAppended = [];
    for (let i = 0; i < size; i++) {
      if (i >= rows.length) {
        toBeAppended.push(data[i]);
      } else if (i >= data.length) {
        toBeDeleted.push(i);
      } else if (tableData.get(rows[i]) !== data[i]) {
        toBeUpdated.push([i, data[i]]);
      }
    }
    toBeUpdated.forEach(([i, d]) => update(rows[i], d, i));
    toBeDeleted.forEach((i, j) => element.deleteRow(i - j));
    toBeAppended.forEach((d) => update(element.insertRow(-1), d, -1));
  };
}
