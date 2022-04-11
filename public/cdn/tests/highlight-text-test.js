import { highlightText } from '../highlight-text.js';

const { module, test } = QUnit;

module('highlight-text.js', function (hooks) {
  hooks.beforeEach(function () {
    this.fixture = document.querySelector('#qunit-fixture');
  });

  test('highlights text', function (assert) {
    [
      ['foo', `<p><mark>foo</mark> bar <mark>foo</mark> baz barfoobar</p>`],
      [/foo/, `<p><mark>foo</mark> bar <mark>foo</mark> baz bar<mark>foo</mark>bar</p>`],
    ].forEach(([filter, expected]) => {
      this.fixture.innerHTML = `<p>foo bar foo baz barfoobar</p>`;
      highlightText(filter, this.fixture);
      let result = this.fixture.querySelectorAll('mark')
      assert.strictEqual(this.fixture.innerHTML, expected);
    });
  });

  test('can iterate over generated marks', function (assert) {
    this.fixture.innerHTML = `<p>foo bar foo baz foo</p>`;
    let marks = highlightText('foo', this.fixture);
    assert.expect(3);
    for (let mark of marks) assert.ok(true);
  });

  test('provides size property', function (assert) {
    this.fixture.innerHTML = `<p>foo bar foo baz foo</p>`;
    let marks = highlightText('foo', this.fixture);
    assert.strictEqual(marks.size, 3);
  });

  test('can remove all', function (assert) {
    this.fixture.innerHTML = `<p>foo bar foo baz foo</p>`;
    let marks = highlightText('foo', this.fixture);
    marks.removeAll();
    let result = this.fixture.querySelectorAll('mark');
    assert.strictEqual(marks.size, 0);
    assert.strictEqual(result.length, 0);
  });
});
