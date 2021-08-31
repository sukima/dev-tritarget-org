import { transitionMachine, interpret } from '../micro-fsm.js';

const { module, test } = QUnit;

module('micro-fsm.js', function() {
  module('#transitionMachine', function() {
    test('transitions to next state', function(assert) {
      let subject = {
        initial: 'test1',
        states: {
          test1: { on: { go: 'test2' } },
        },
      };
      let state = transitionMachine(subject, undefined, '#init');
      assert.deepEqual(state, {
        actions: [],
        value: 'test1',
        states: ['test1'],
        inState: { test1: true },
        changed: true,
      });
      state = transitionMachine(subject, state, 'go');
      assert.deepEqual(state, {
        actions: [],
        value: 'test2',
        states: ['test2'],
        inState: { test2: true },
        changed: true,
      });
    });

    test('does not transition when event does not exist on state', function(assert) {
      let subject = {
        initial: 'test1',
        states: {
          test1: {},
        },
      };
      let state = transitionMachine(subject, undefined, '#init');
      state = transitionMachine(subject, state, 'go');
      assert.deepEqual(state, {
        actions: [],
        value: 'test1',
        states: ['test1'],
        inState: { test1: true },
        changed: false,
      });
    });

    test('handles top-level transitions', function(assert) {
      let subject = {
        initial: 'test1',
        on: { go: 'test2' },
        states: {
          test1: {},
        },
      };
      let state = transitionMachine(subject, undefined, '#init');
      assert.deepEqual(state, {
        actions: [],
        value: 'test1',
        states: ['test1'],
        inState: { test1: true },
        changed: true,
      });
      state = transitionMachine(subject, state, 'go');
      assert.deepEqual(state, {
        actions: [],
        value: 'test2',
        states: ['test2'],
        inState: { test2: true },
        changed: true,
      });
    });

    test('provides actions with named callbacks', function(assert) {
      let subject = {
        initial: 'test1',
        states: {
          test1: {
            entry: 'testEntry1',
            exit: ['testExit1', 'testExit2'],
            on: {
              go: {
                target: 'test2',
                actions: ['testAction1', 'testAction2'],
              },
            },
          },
          test2: { entry: ['testEntry2', 'testEntry3'] },
        },
      };
      let state = transitionMachine(subject, undefined, '#init');
      assert.deepEqual(state.actions, ['testEntry1']);
      state = transitionMachine(subject, state, 'go');
      assert.deepEqual(state.actions, [
        'testExit1',
        'testExit2',
        'testAction1',
        'testAction2',
        'testEntry2',
        'testEntry3',
      ]);
    });

    test('handles self referencing transitions', function(assert) {
      let subject = {
        initial: 'test1',
        states: {
          test1: {
            entry: 'entryAction',
            on: {
              go: { target: 'test1', actions: 'transitionAction' },
            },
            exit: 'exitAction',
          },
        },
      };
      let state = transitionMachine(subject, { value: 'test1' }, 'go');
      assert.deepEqual(state, {
        actions: ['transitionAction'],
        value: 'test1',
        states: ['test1'],
        inState: { test1: true },
        changed: false,
      });
    });

    test('similates nesting with colon syntax', function(assert) {
      let subject = {
        initial: 'test1:foo:bar',
        states: {
          'test1:foo:bar': {},
        },
      };
      let state = transitionMachine(subject, undefined, '#init');
      assert.deepEqual(state, {
        actions: [],
        value: 'test1:foo:bar',
        states: ['test1', 'foo', 'bar'],
        inState: { test1: true, foo: true, bar: true },
        changed: true,
      });
    });
  });

  module('#interpret', function() {
    test('it transitions', function(assert) {
      let subject = interpret({
        initial: 'test1',
        states: {
          test1: {
            on: { go: 'test2' },
          },
        },
      }).start();
      subject.send('go');
      assert.deepEqual(subject.state, {
        actions: [],
        value: 'test2',
        states: ['test2'],
        inState: { test2: true },
        changed: true,
      });
    });

    test('it calls onTransition callbacks', function(assert) {
      let spyCallCount = 0;
      let subject = interpret({
        initial: 'test1',
        states: {
          test1: {
            on: { go: 'test2' },
          },
        },
      })
        .onTransition(() => spyCallCount++)
        .start();
      subject.send('go');
      assert.equal(spyCallCount, 2);
    });

    test('it executes actions on actions object', function(assert) {
      let spyCallCount = 0;
      let subject = interpret({
        initial: 'test1',
        states: {
          test1: {
            entry: 'testAction',
            exit: 'testAction',
            on: {
              go: { target: 'test2', actions: 'testAction' },
            },
          },
        },
      }, {
        testAction: () => spyCallCount++,
      }).start();
      subject.send('go');
      assert.equal(spyCallCount, 3);
    });
  });

  module('Traffic Light Example', function(hooks) {
    hooks.beforeEach(function() {
      this.subject = {
        initial: 'green',
        states: {
          green: {
            on: {
              change: 'yellow',
              caution: 'blink-yellow',
              stop: 'blink-red',
            },
          },
          yellow: {
            on: {
              change: 'red',
              caution: 'blink-yellow',
              stop: 'blink-red',
            },
          },
          red: {
            on: {
              change: 'green',
              caution: 'blink-yellow',
              stop: 'blink-red',
            },
          },
          'blink-yellow': {
            on: {
              cancel: 'green',
              stop: 'blink-red',
            },
          },
          'blink-red': {
            on: {
              cancel: 'green',
              caution: 'blink-yellow',
            },
          },
        },
      };
      this.transition = (eventName, state) => transitionMachine(this.subject, state, { type: eventName });
    });

    test('initial state is green', function(assert) {
      let resultState = this.transition('#init');
      assert.equal(resultState.value, 'green');
    });

    test('can reach blinking yellow state from green', function(assert) {
      let resultState = { value: 'green' };
      resultState = this.transition('caution', resultState);
      assert.equal(resultState.value, 'blink-yellow');
      resultState = this.transition('cancel', resultState);
      assert.equal(resultState.value, 'green');
    });

    test('can reach blinking red state from green', function(assert) {
      let resultState = { value: 'green' };
      resultState = this.transition('stop', resultState);
      assert.equal(resultState.value, 'blink-red');
      resultState = this.transition('cancel', resultState);
      assert.equal(resultState.value, 'green');
    });

    test('can reach blinking yellow state from yellow', function(assert) {
      let resultState = { value: 'yellow' };
      resultState = this.transition('caution', resultState);
      assert.equal(resultState.value, 'blink-yellow');
      resultState = this.transition('cancel', resultState);
      assert.equal(resultState.value, 'green');
    });

    test('can reach blinking red state from yellow', function(assert) {
      let resultState = { value: 'yellow' };
      resultState = this.transition('stop', resultState);
      assert.equal(resultState.value, 'blink-red');
      resultState = this.transition('cancel', resultState);
      assert.equal(resultState.value, 'green');
    });

    test('can reach blinking yellow state from red', function(assert) {
      let resultState = { value: 'red' };
      resultState = this.transition('caution', resultState);
      assert.equal(resultState.value, 'blink-yellow');
      resultState = this.transition('cancel', resultState);
      assert.equal(resultState.value, 'green');
    });

    test('can reach blinking red state from red', function(assert) {
      let resultState = { value: 'red' };
      resultState = this.transition('stop', resultState);
      assert.equal(resultState.value, 'blink-red');
      resultState = this.transition('cancel', resultState);
      assert.equal(resultState.value, 'green');
    });

    test('can cycle through all lights', function(assert) {
      let service = interpret(this.subject).start();
      assert.equal(service.state.value, 'green');
      service.send('change');
      assert.equal(service.state.value, 'yellow');
      service.send('change');
      assert.equal(service.state.value, 'red');
      service.send('change');
      assert.equal(service.state.value, 'green');
    });
  });
});
