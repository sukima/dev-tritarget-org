import { confineTabbing, releaseTabbing } from '../tabbing.js';

const { module, test } = QUnit;

module('tabbing.js', function(hooks) {
  hooks.beforeEach(function() {
    this.fixture = document.querySelector('#qunit-fixture');
    this.fixture.innerHTML = `
      <div class="test-body">
        <a id="test1" data-orig="0" data-expected="0"></a>
        <a id="test2" href="#" data-orig="0" data-expected="-1"></a>
        <button id="test3" data-orig="0" data-expected="-1"></button>
        <select id="test4" data-orig="0" data-expected="-1"></select>
        <textarea id="test5" data-orig="0" data-expected="-1"></textarea>
        <input id="test6" type="hidden" data-orig="0" data-expected="-1">
        <input id="test7" type="hidden" disabled data-orig="0" data-expected="0">
        <input id="test8" type="text" data-orig="0" data-expected="-1">
        <input id="test9" type="text" disabled data-orig="0" data-expected="0">
        <input id="test10" type="text" tabindex="2" data-orig="2" data-expected="-1">
      </div>
      <dialog class="test-dialog">
        <a id="test11" data-orig="0" data-expected="0"></a>
        <a id="test12" href="#" data-orig="0" data-expected="0" data-first></a>
        <button id="test13" data-orig="0" data-expected="0"></button>
        <select id="test14" data-orig="0" data-expected="0"></select>
        <textarea id="test15" data-orig="0" data-expected="0"></textarea>
        <input id="test16" type="hidden" data-orig="0" data-expected="0">
        <input id="test17" type="hidden" disabled data-orig="0" data-expected="0">
        <input id="test18" type="text" data-orig="0" data-expected="0">
        <input id="test19" type="text" disabled data-orig="0" data-expected="0">
        <input id="test20" type="text" tabindex="2" data-orig="2" data-expected="2">
      </dialog>
    `;
    this.selectAll = s => this.fixture.querySelectorAll(s);
    this.testBody = this.fixture.querySelector('.test-body');
    this.testDialog = this.fixture.querySelector('.test-dialog');
  });

  module('#confineTabbing', function() {
    test('confines tabindexes', function(assert) {
      const expectedTabIndex = e => parseInt(e.dataset.expected, 10);
      let returnValue = confineTabbing(this.testDialog, this.selectAll);
      assert.strictEqual(
        returnValue,
        this.fixture.querySelector('[data-first]'),
        'returns first focusable element within'
      );
      for (let element of this.selectAll('.test-body>*')) {
        assert.strictEqual(
          element.tabIndex,
          expectedTabIndex(element),
          `fixture > ${element.nodeName} (${element.id})`
        );
      }
      for (let element of this.selectAll('.test-dialog>*')) {
        assert.strictEqual(
          element.tabIndex,
          expectedTabIndex(element),
          `fixture > dialog > ${element.nodeName} (${element.id})`
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
          `fixture > ${element.nodeName} (${element.id})`
        );
      }
      for (let element of this.selectAll('.test-dialog>*')) {
        assert.strictEqual(
          element.tabIndex,
          expectedTabIndex(element),
          `fixture > dialog > ${element.nodeName} (${element.id})`
        );
      }
    });
  });
});
