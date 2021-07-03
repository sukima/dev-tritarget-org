import $ from '../simple-dom.js';

const { module, test } = QUnit;

module('simple-dom.js', function(hooks) {
  hooks.beforeEach(function() {
    this.fixture = document.querySelector('#qunit-fixture');
    this.fixture.innerHTML = `
      <p id="foo">FOO</p>
      <p data-bar>BAR</p>
      <ul><li>1</li><li>2</li><li>3</li></ul>
      <button type="button">BTN1</button>
      <button type="button">BTN2</button>
    `;
    this.subject = $(this.fixture);
  });

  test('can dereference simple-dom proxies', function(assert) {
    assert.strictEqual($(this.subject), this.subject);
  });

  test('can query by ID', function(assert) {
    assert.strictEqual(
      this.subject.foo.element,
      this.fixture.querySelector('#foo')
    );
  });

  test('can query by selector', function(assert) {
    assert.strictEqual(
      this.subject['[data-bar]'].element,
      this.fixture.querySelector('[data-bar]')
    );
    assert.deepEqual(
      $.all['[data-bar]'].elements,
      [...this.fixture.querySelectorAll('[data-bar]')]
    );
  });

  test('can access DOM properties', function(assert) {
    assert.equal(this.subject.foo.textContent.trim(), 'FOO');
    assert.deepEqual(
      this.subject.all['ul>li'].map(i => i.textContent.trim()),
      ['1', '2', '3']
    );
  });

  test('can assign to DOM properties', function(assert) {
    this.subject.foo.textContent = 'BAZ';
    this.subject.all['ul>li'].forEach((e, i) => e.textContent = `X${i}`),
    assert.equal(this.fixture.querySelector('#foo').textContent.trim(), 'BAZ');
    assert.deepEqual(
      [...this.fixture.querySelectorAll('ul>li')].map(i => i.textContent.trim()),
      ['X0', 'X1', 'X2']
    );
  });

  test('can attach events to a single element', function(assert) {
    let callCount = 0;
    this.subject.button.on.click(() => callCount++);
    this.fixture.querySelector('button').click();
    assert.equal(callCount, 1, 'spy called');
  });

  test('can attach events to multiple elements', function(assert) {
    let callCount = 0;
    this.subject.all.button.on.click(() => callCount++);
    this.fixture.querySelectorAll('button').forEach(i => i.click());
    assert.equal(callCount, 2, 'spy called');
  });

  test('can attach multiple events', function(assert) {
    let callCount = 0;
    let button = this.fixture.querySelector('button');
    this.subject.button.on['click,foo,bar'](() => callCount++);
    button.click();
    button.dispatchEvent(new CustomEvent('foo'));
    button.dispatchEvent(new CustomEvent('bar'));
    assert.equal(callCount, 3, 'spy called');
  });

  test('can detach events', function(assert) {
    let callCount = 0;
    let button = this.fixture.querySelector('button');
    let detach1 = this.subject.button.on['click,foo,bar'](() => callCount++);
    let detach2 = this.subject.all.button.on.click(() => callCount++);
    detach1();
    detach2();
    this.fixture.querySelectorAll('button').forEach(i => i.click());
    button.dispatchEvent(new CustomEvent('foo'));
    button.dispatchEvent(new CustomEvent('bar'));
    assert.equal(callCount, 0, 'spy never called');
  });
});
