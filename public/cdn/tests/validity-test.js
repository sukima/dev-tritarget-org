import { setValidity, validate } from '../validity.js';

const { module, test } = QUnit;

const defer = () => {
  let resolve, reject;
  let promise = new Promise((a, b) => (resolve = a, reject = b));
  return { resolve, reject, promise };
};

module('validity.js', function(hooks) {
  hooks.beforeEach(function() {
    this.fixture = document.querySelector('#qunit-fixture');
    this.fixture.innerHTML = `<input><input><input>`;
    this.subjects = [...this.fixture.querySelectorAll('input')];
  });

  module('#setValidity', function() {
    test('errors if element already had validity set', async function(assert) {
      let [subject] = this.subjects;
      setValidity(subject);
      assert.throws(
        () => setValidity(subject),
        /An element can only have one validator registered on it/
      );
    });

    test('returns a teardown function', async function(assert) {
      assert.expect(0);
      let [subject] = this.subjects;
      let teardown = setValidity(subject);
      teardown();
      setValidity(subject);
    });

    test('sets custom validity', async function(assert) {
      await Promise.all(this.subjects.map(subject => {
        return new Promise(resolve => {
          setValidity(subject, () => (resolve(), ['test-message']));
          subject.dispatchEvent(new FocusEvent('blur'));
        });
      }));
      for (let input of this.subjects) {
        assert.equal(input.validationMessage, 'test-message');
        assert.strictEqual(input.validity.valid, false);
        assert.strictEqual(input.validity.customError, true);
      }
    });

    test('validates on custom events', async function(assert) {
      await Promise.all(this.subjects.map(subject => {
        return new Promise(resolve => {
          setValidity(subject, () => (resolve(), ['test-message']), { on: 'foobar' });
          subject.dispatchEvent(new CustomEvent('foobar'));
        });
      }));
      for (let input of this.subjects) {
        assert.equal(input.validationMessage, 'test-message');
        assert.strictEqual(input.validity.valid, false);
        assert.strictEqual(input.validity.customError, true);
      }
    });

    test('passes element as argument to validator', async function(assert) {
      let calledArgs = [];
      await Promise.all(this.subjects.map(subject => {
        return new Promise(resolve => {
          setValidity(subject, (...args) => {
            calledArgs.push(args);
            resolve();
            return ['test-message'];
          });
          subject.dispatchEvent(new FocusEvent('validate'));
        });
      }));
      assert.strictEqual(calledArgs[0][0], this.subjects[0]);
      assert.strictEqual(calledArgs[1][0], this.subjects[1]);
      assert.strictEqual(calledArgs[2][0], this.subjects[2]);
    });

    test('dispatches the "validated" event', async function(assert) {
      let eventCalls = 0;
      this.subjects.forEach(s => s.addEventListener('validated', () => eventCalls++));
      await Promise.all(this.subjects.map(subject => {
        return new Promise(resolve => {
          setValidity(subject, () => (resolve(), []), { on: '' });
          subject.dispatchEvent(new CustomEvent('validate'));
        });
      }));
      assert.equal(eventCalls, 3);
    });

    test('bubbles the "validated" event', async function(assert) {
      let eventCalls = 0;
      document.addEventListener('validated', () => eventCalls++);
      await Promise.all(this.subjects.map(subject => {
        return new Promise(resolve => {
          setValidity(subject, () => (resolve(), []), { on: '' });
          subject.dispatchEvent(new CustomEvent('validate'));
        });
      }));
      assert.equal(eventCalls, 3);
    });

    test('flattens multiple events in same validation execution', async function(assert) {
      let eventCalls = 0;
      let [subject] = this.subjects;
      await new Promise(resolve => {
        setValidity(subject, () => (eventCalls++, resolve(), []), { on: '' });
        subject.dispatchEvent(new CustomEvent('validate'));
        subject.dispatchEvent(new CustomEvent('validate'));
        subject.dispatchEvent(new CustomEvent('validate'));
      });
      assert.equal(eventCalls, 1);
    });

    test('handles async tasks', async function(assert) {
      await Promise.all(this.subjects.map(subject => {
        return new Promise(resolve => {
          let handler = async () => {
            await new Promise(r => setTimeout(r, 10));
            resolve();
            return ['test-message'];
          };
          setValidity(subject, handler);
          subject.dispatchEvent(new CustomEvent('validate'));
        });
      }));
      for (let input of this.subjects) {
        assert.equal(input.validationMessage, 'test-message');
        assert.strictEqual(input.validity.valid, false);
        assert.strictEqual(input.validity.customError, true);
      }
    });
  });

  module('#validate', function() {
    test('dispatches the "validate" event', async function(assert) {
      let eventCalls = 0;
      this.subjects.forEach(s => setValidity(s, undefined, { on: '' }));
      this.subjects.forEach(s => s.addEventListener('validate', () => eventCalls++));
      await validate(...this.subjects);
      assert.equal(eventCalls, 3);
    });

    test('will call validations', async function(assert) {
      let validationCalls = 0;
      let testValidate = () => (validationCalls++, []);
      this.subjects.forEach(s => setValidity(s, testValidate, { on: '' }));
      await validate(...this.subjects);
      assert.equal(validationCalls, 3);
    });

    test('handles async tasks', async function(assert) {
      let validationCalls = 0;
      let testValidate = async () => {
        await new Promise(r => setTimeout(r, 10));
        validationCalls++;
        return [];
      };
      this.subjects.forEach(s => setValidity(s, testValidate, { on: '' }));
      await validate(...this.subjects);
      assert.equal(validationCalls, 3);
    });

    test('skips validating elements not setup with setValidity', async function(assert) {
      let validationCalls = 0;
      let testValidate = () => (validationCalls++, []);
      setValidity(this.subjects[0], testValidate, { on: '' });
      setValidity(this.subjects[2], testValidate, { on: '' });
      await validate(...this.subjects);
      assert.equal(validationCalls, 2);
    });
  });
});
