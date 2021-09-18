import { dataUpdater, tableUpdater, listUpdater } from '../array-updater.js';

const { module, test } = QUnit;

const propMatcher = (prop) => (a, b) => a[prop] === b[prop];

module('array-updater.js', function() {
  module('#dataUpdater', function() {
    test('it calls append and render for new data', function(assert) {
      let testData = [];
      let subject = dataUpdater({
        query: () => testData,
        append: () => (testData.push({}), testData[testData.length - 1]),
        render: (i, d) => { i.data = d.value },
        remove: i => testData.splice(i, 1),
        matcher: propMatcher('value'),
      });
      subject([{ value: 1 }, { value: 2 }, { value: 3 }]);
      assert.deepEqual(testData, [{ data: 1 }, { data: 2 }, { data: 3 }]);
    });

    test('it updates table rows based on data changes', function(assert) {
      let testData = [];
      let subject = dataUpdater({
        query: () => testData,
        append: () => (testData.push({}), testData[testData.length - 1]),
        render: (i, d) => { i.data = d.value },
        remove: i => testData.splice(i, 1),
        matcher: propMatcher('value'),
      });
      subject([{ value: 1 }, { value: 2 }, { value: 3 }]);
      assert.deepEqual(testData, [{ data: 1 }, { data: 2 }, { data: 3 }]);
      subject([{ value: 4 }, { value: 5 }, { value: 6 }]);
      assert.deepEqual(testData, [{ data: 4 }, { data: 5 }, { data: 6 }]);
    });

    test('it removes table rows based on data changes', function(assert) {
      let testData = [];
      let subject = dataUpdater({
        query: () => testData,
        append: () => (testData.push({}), testData[testData.length - 1]),
        render: (i, d) => { i.data = d.value },
        remove: i => testData.splice(i, 1),
        matcher: propMatcher('value'),
      });
      subject([{ value: 1 }, { value: 2 }, { value: 3 }]);
      assert.deepEqual(testData, [{ data: 1 }, { data: 2 }, { data: 3 }]);
      subject([{ value: 1 }, { value: 3 }]);
      assert.deepEqual(testData, [{ data: 1 }, { data: 3 }]);
    });

    test('returns the data', function(assert) {
      let testData = [];
      let subject = dataUpdater({
        query: () => testData,
        append: () => (testData.push({}), testData[testData.length - 1]),
        render: (i, d) => { i.data = d.value },
        remove: i => testData.splice(i, 1),
        matcher: propMatcher('value'),
      });
      let expected = [{ value: 1 }, { value: 2 }, { value: 3 }];
      let actual = subject(expected);
      assert.deepEqual(actual, expected);
    });
  });

  module('#tableUpdator', function(hooks) {
    const matcher = propMatcher('value');
    const actuals = table => [...table.rows].map(i => i.textContent);
    const render = (row, data) => {
      let cell = row.cells[0] ?? row.insertCell();
      cell.textContent = data.value;
    };

    hooks.beforeEach(function() {
      this.fixture = document.querySelector('#qunit-fixture');
      this.fixture.innerHTML = `<table><tbody></tbody></table>`;
    });

    test('it inserts table rows based on data changes', function(assert) {
      let table = this.fixture.querySelector('table');
      let subject = tableUpdater(table, render, { matcher });
      subject([{ value: 1 }, { value: 2 }, { value: 3 }]);
      assert.deepEqual(actuals(table), ['1', '2', '3']);
    });

    test('it updates table rows based on data changes', function(assert) {
      let table = this.fixture.querySelector('table');
      let subject = tableUpdater(table, render, { matcher });
      subject([{ value: 1 }, { value: 2 }, { value: 3 }]);
      assert.deepEqual(actuals(table), ['1', '2', '3']);
      subject([{ value: 4 }, { value: 5 }, { value: 6 }]);
      assert.deepEqual(actuals(table), ['4', '5', '6']);
    });

    test('it removes table rows based on data changes', function(assert) {
      let table = this.fixture.querySelector('table');
      let subject = tableUpdater(table, render, { matcher });
      subject([{ value: 1 }, { value: 2 }, { value: 3 }]);
      assert.deepEqual(actuals(table), ['1', '2', '3']);
      subject([{ value: 1 }, { value: 3 }]);
      assert.deepEqual(actuals(table), ['1', '3']);
    });
  });

  module('#listUpdater', function(hooks) {
    const matcher = propMatcher('value');
    const actuals = list => [...list.childNodes].map(i => i.textContent);
    const render = (item, data) => { item.textContent = data.value };

    hooks.beforeEach(function() {
      this.fixture = document.querySelector('#qunit-fixture');
      this.fixture.innerHTML = `<ol></ol>`;
    });

    test('it inserts list items based on data changes', function(assert) {
      let list = this.fixture.querySelector('ol');
      let subject = listUpdater(list, render, { matcher });
      subject([{ value: 1 }, { value: 2 }, { value: 3 }]);
      assert.deepEqual(actuals(list), ['1', '2', '3']);
    });

    test('it updates list items based on data changes', function(assert) {
      let list = this.fixture.querySelector('ol');
      let subject = listUpdater(list, render, { matcher });
      subject([{ value: 1 }, { value: 2 }, { value: 3 }]);
      assert.deepEqual(actuals(list), ['1', '2', '3']);
      subject([{ value: 4 }, { value: 5 }, { value: 6 }]);
      assert.deepEqual(actuals(list), ['4', '5', '6']);
    });

    test('it removes list items based on data changes', function(assert) {
      let list = this.fixture.querySelector('ol');
      let subject = listUpdater(list, render, { matcher });
      subject([{ value: 1 }, { value: 2 }, { value: 3 }]);
      assert.deepEqual(actuals(list), ['1', '2', '3']);
      subject([{ value: 1 }, { value: 3 }]);
      assert.deepEqual(actuals(list), ['1', '3']);
    });
  });
});
