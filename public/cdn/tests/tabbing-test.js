import { confineTabbing, releaseTabbing } from '../tabbing.js';

const { module, test } = QUnit;

module('tabbing.js', function(hooks) {
  hooks.beforeEach(function() {
    this.fixture = document.querySelector('#qunit-fixture');
    this.fixture.innerHTML = `
      <div class="test-body">
        <a data-orig="0" data-expected="0"></a>
        <a href="#" data-orig="0" data-expected="-1"></a>
        <button data-orig="0" data-expected="-1"></button>
        <select data-orig="0" data-expected="-1"></select>
        <textarea data-orig="0" data-expected="-1"></textarea>
        <input type="hidden" data-orig="0" data-expected="0">
        <input type="text" data-orig="0" data-expected="-1">
        <input type="text" tabindex="2" data-orig="2" data-expected="-1">
      </div>
      <dialog class="test-dialog">
        <a data-orig="0" data-expected="0"></a>
        <a href="#" data-orig="0" data-expected="0"></a>
        <button data-orig="0" data-expected="0"></button>
        <select data-orig="0" data-expected="0"></select>
        <textarea data-orig="0" data-expected="0"></textarea>
        <input type="hidden" data-orig="0" data-expected="0">
        <input type="text" data-orig="0" data-expected="0">
        <input type="text" tabindex="2" data-orig="2" data-expected="2">
      </dialog>
    `;
    this.selectAll = s => this.fixture.querySelectorAll(s);
    this.testBody = this.fixture.querySelector('.test-body');
    this.testDialog = this.fixture.querySelector('.test-dialog');
  });

  module('#confineTabbing', function() {
    test('confines tabindexes', function(assert) {
      const expectedTabIndex = e => parseInt(e.dataset.expected, 10);
      confineTabbing(this.testDialog, this.selectAll);
      for (let element of this.selectAll('.test-body>*')) {
        assert.strictEqual(
          element.tabIndex,
          expectedTabIndex(element),
          `fixture > ${element.nodeName}`
        );
      }
      for (let element of this.selectAll('.test-dialog>*')) {
        assert.strictEqual(
          element.tabIndex,
          expectedTabIndex(element),
          `fixture > dialog > ${element.nodeName}`
        );
      }
    });
  });

  module('#releaseTabbing', function(hooks) {
    hooks.beforeEach(function() {
      confineTabbing(this.testDialog, this.selectAll);
    });

    test('releases tabindexes', function(assert) {
      const expectedTabIndex = e => parseInt(e.dataset.orig, 10);
      releaseTabbing(this.selectAll);
      for (let element of this.selectAll('.test-body>*')) {
        assert.strictEqual(
          element.tabIndex,
          expectedTabIndex(element),
          `fixture > ${element.nodeName}`
        );
      }
      for (let element of this.selectAll('.test-dialog>*')) {
        assert.strictEqual(
          element.tabIndex,
          expectedTabIndex(element),
          `fixture > dialog > ${element.nodeName}`
        );
      }
    });
  });
});
