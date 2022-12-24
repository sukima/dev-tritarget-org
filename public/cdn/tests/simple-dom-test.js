import $ from '../simple-dom.js';

const { module, test } = QUnit;

module('simple-dom.js', function (hooks) {
  hooks.beforeEach(function () {
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

  test('can dereference simple-dom proxies', function (assert) {
    assert.strictEqual($(this.subject), this.subject);
  });

  module('Querying', function () {
    test('can query by ID', function (assert) {
      assert.strictEqual(
        this.subject.foo.element,
        this.fixture.querySelector('#foo')
      );
    });

    test('can query by selector', function (assert) {
      assert.strictEqual(
        this.subject['[data-bar]'].element,
        this.fixture.querySelector('[data-bar]')
      );
      assert.deepEqual(
        $.all['[data-bar]'].elements,
        [...this.fixture.querySelectorAll('[data-bar]')]
      );
    });

    test('can access DOM properties', function (assert) {
      assert.equal(this.subject.foo.textContent.trim(), 'FOO');
      assert.deepEqual(
        this.subject.all['ul>li'].map(i => i.textContent.trim()),
        ['1', '2', '3']
      );
    });

    test('can assign to DOM properties', function (assert) {
      this.subject.foo.textContent = 'BAZ';
      this.subject.all['ul>li'].forEach((e, i) => e.textContent = `X${i}`),
      assert.equal(this.fixture.querySelector('#foo').textContent.trim(), 'BAZ');
      assert.deepEqual(
        [...this.fixture.querySelectorAll('ul>li')].map(i => i.textContent.trim()),
        ['X0', 'X1', 'X2']
      );
    });
  });

  module('Events', function () {
    test('can attach events to a single element', function (assert) {
      let callCount = 0;
      this.subject.button.on.click(() => callCount++);
      this.fixture.querySelector('button').click();
      assert.equal(callCount, 1, 'spy called');
    });

    test('can attach events to multiple elements', function (assert) {
      let callCount = 0;
      this.subject.all.button.on.click(() => callCount++);
      this.fixture.querySelectorAll('button').forEach(i => i.click());
      assert.equal(callCount, 2, 'spy called');
    });

    test('can attach multiple events', function (assert) {
      let callCount = 0;
      let button = this.fixture.querySelector('button');
      this.subject.button.on['click,foo,bar'](() => callCount++);
      button.click();
      button.dispatchEvent(new CustomEvent('foo'));
      button.dispatchEvent(new CustomEvent('bar'));
      assert.equal(callCount, 3, 'spy called');
    });

    test('can detach events', function (assert) {
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

    test('attached events are iterable', async function (assert) {
      async function iterationTest(events) {
        for await (let event of events) {
          assert.step(event.type);
          break;
        }
      }

      let button = this.fixture.querySelector('button');
      let iterationWaiters = [
        iterationTest(this.subject.button.on['foo']()),
        iterationTest(this.subject.button.on['bar']().events()),
      ];

      button.dispatchEvent(new CustomEvent('foo'));
      button.dispatchEvent(new CustomEvent('foo'));
      button.dispatchEvent(new CustomEvent('bar'));
      button.dispatchEvent(new CustomEvent('bar'));

      await Promise.all(iterationWaiters);

      assert.verifySteps(['foo', 'bar']);
    });
  });

  module('Creation', function () {
    test('can create a div', function (assert) {
      let actual = this.subject.new.div();
      assert.ok(actual instanceof Element);
      assert.equal(actual.tagName, 'DIV');
      actual = this.subject.new.button();
      assert.equal(actual.tagName, 'BUTTON');
    });

    test('adds classes', function (assert) {
      let actual = this.subject.new.div({ class: '  foo   bar bar ' });
      assert.ok(actual.classList.contains('foo'));
      assert.ok(actual.classList.contains('bar'));
      actual = this.subject.new.div({ classes: ['foo', 'bar', 'bar'] });
      assert.equal(actual.className, 'foo bar');
    });

    test('adds dataset', function (assert) {
      let actual = this.subject.new.div({ data: { foo: 'bar' } });
      assert.equal(actual.dataset.foo, 'bar');
    });

    test('adds attributes', function (assert) {
      let actual = this.subject.new.div({ attrs: { 'aria-label': 'bar' } });
      assert.equal(actual.getAttribute('aria-label'), 'bar');
    });

    test('adds properties', function (assert) {
      let actual = this.subject.new.div({ foo: 'bar' });
      assert.equal(actual.foo, 'bar');
    });

    test('sets textContent', function (assert) {
      let actual = this.subject.new.div({ text: '<b>bar</b>' });
      assert.equal(actual.innerHTML, '&lt;b&gt;bar&lt;/b&gt;');
    });

    test('sets innerHTML', function (assert) {
      let actual = this.subject.new.div({ html: '<b>bar</b>' });
      assert.equal(actual.innerHTML, '<b>bar</b>');
    });
  });

});
