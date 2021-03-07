import { tableUpdater } from '../table-updater.js';

const { module, test } = QUnit;

module('table-updater.js', function(hooks) {
  hooks.beforeEach(function() {
    this.fixture = document.querySelector('#qunit-fixture');
    this.fixture.innerHTML = `<table><tbody></tbody></table>`;
    this.renderRow = (row, data) => {
      let cell = row.cells[0] ?? row.insertCell();
      cell.textContent = data.value;
    };
  });

  test('it inserts table rows based on data changes', function(assert) {
    let table = this.fixture.querySelector('table');
    let subject = tableUpdater(table, this.renderRow);
    subject([{ value: 1 }, { value: 2 }, { value: 3 }]);
    assert.deepEqual([...table.rows].map(r => r.textContent), ['1', '2', '3']);
  });

  test('it updates table rows based on data changes', function(assert) {
    let table = this.fixture.querySelector('table');
    let subject = tableUpdater(table, this.renderRow);
    subject([{ value: 1 }, { value: 2 }, { value: 3 }]);
    assert.deepEqual([...table.rows].map(r => r.textContent), ['1', '2', '3']);
    subject([{ value: 4 }, { value: 5 }, { value: 6 }]);
    assert.deepEqual([...table.rows].map(r => r.textContent), ['4', '5', '6']);
  });

  test('it removes table rows based on data changes', function(assert) {
    let table = this.fixture.querySelector('table');
    let subject = tableUpdater(table, this.renderRow);
    subject([{ value: 1 }, { value: 2 }, { value: 3 }]);
    assert.deepEqual([...table.rows].map(r => r.textContent), ['1', '2', '3']);
    subject([{ value: 1 }, { value: 3 }]);
    assert.deepEqual([...table.rows].map(r => r.textContent), ['1', '3']);
  });
});
