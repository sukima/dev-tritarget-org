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
      assert.strictEqual(
        this.subject('[data-bar]').element,
        this.fixture.querySelector('[data-bar]')
      );
      assert.deepEqual(
        $.all['[data-bar]'].elements,
        [...this.fixture.querySelectorAll('[data-bar]')]
      );
      assert.deepEqual(
        $.all('[data-bar]').elements,
        [...this.fixture.querySelectorAll('[data-bar]')]
      );
    });

    test('can query by Node', function (assert) {
      let fixtureEls = [...this.fixture.querySelectorAll('[data-bar]')];
      assert.strictEqual(this.subject(fixtureEls[0]).element, fixtureEls[0]);
      assert.deepEqual($.all(...fixtureEls).elements, fixtureEls);
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
      this.subject.button.on.click(() => assert.step('called'));
      this.fixture.querySelector('button').click();
      this.fixture.querySelector('button').click();
      assert.verifySteps(['called', 'called']);
    });

    test('can attach events to multiple elements', function (assert) {
      this.subject.all.button.on.click(() => assert.step('called'));
      this.fixture.querySelectorAll('button').forEach(i => i.click());
      assert.verifySteps(['called', 'called']);
    });

    test('can attach multiple events', function (assert) {
      let button = this.fixture.querySelector('button');
      this.subject.button.on['click,foo,bar'](() => assert.step('called'));
      button.click();
      button.dispatchEvent(new CustomEvent('foo'));
      button.dispatchEvent(new CustomEvent('bar'));
      assert.verifySteps(['called', 'called', 'called']);
    });

    module('once', function () {
      test('can attach events', async function (assert) {
        let promise = this.subject.button.once.click();
        this.fixture.querySelector('button').click();
        this.fixture.querySelector('button').click();
        let event = await promise;
        assert.ok(typeof event !== 'undefiend');
      });

      test('can attach events to multiple elements', async function (assert) {
        let promise = this.subject.button.once.click();
        this.fixture.querySelectorAll('button').forEach(i => i.click());
        let event = await promise;
        assert.ok(typeof event !== 'undefiend');
      });

      test('can attach multiple events', async function (assert) {
        let button = this.fixture.querySelector('button');
        let promise = this.subject.button.once['click,foo,bar']();
        button.click();
        button.dispatchEvent(new CustomEvent('foo'));
        button.dispatchEvent(new CustomEvent('bar'));
        let event = await promise;
        assert.ok(typeof event !== 'undefiend');
      });
    });

    test('can detach events', function (assert) {
      let button = this.fixture.querySelector('button');
      let detach1 = this.subject.button.on['click,foo,bar'](() => assert.step('called'));
      let detach2 = this.subject.all.button.on.click(() => assert.step('called'));
      detach1();
      detach2();
      this.fixture.querySelectorAll('button').forEach(i => i.click());
      button.dispatchEvent(new CustomEvent('foo'));
      button.dispatchEvent(new CustomEvent('bar'));
      assert.verifySteps([]);
    });

    module('async iterator API', function () {
      test('events are iterable', async function (assert) {
        async function iterationTest(events) {
          for await (let event of events) {
            assert.step(event.type);
            break;
          }
          assert.step('done');
        }

        let button = this.fixture.querySelector('button');
        let iterationWaiters = [
          iterationTest(this.subject.button.on.foo()),
          iterationTest(this.subject.button.on.bar().events()),
        ];

        button.dispatchEvent(new CustomEvent('foo'));
        button.dispatchEvent(new CustomEvent('foo'));
        button.dispatchEvent(new CustomEvent('bar'));
        button.dispatchEvent(new CustomEvent('bar'));

        await Promise.all(iterationWaiters);

        assert.verifySteps(['foo', 'bar', 'done', 'done']);
      });

      test('it can be aborted', async function (assert) {
        async function iterationTest(events, abort) {
          for await (let event of events) assert.step(event.type);
          assert.step('done');
        }

        let button = this.fixture.querySelector('button');
        let fooEvents = this.subject.button.on.foo();
        let barEvents = this.subject.button.on.bar();
        let iterationWaiters = [
          iterationTest(fooEvents),
          iterationTest(barEvents.events()),
        ];

        button.dispatchEvent(new CustomEvent('foo'));
        fooEvents.abort();
        button.dispatchEvent(new CustomEvent('foo'));

        button.dispatchEvent(new CustomEvent('bar'));
        barEvents.abort();
        button.dispatchEvent(new CustomEvent('bar'));

        await Promise.all(iterationWaiters);

        assert.verifySteps(['foo', 'bar', 'done', 'done']);
      });
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
