import { setValidity, validate } from '../validity.js';

const { module, test } = QUnit;

module('validity.js', function(hooks) {
  hooks.beforeEach(function() {
    this.fixture = document.querySelector('#qunit-fixture');
    this.fixture.innerHTML = `<input><input><input>`;
    this.subjects = this.fixture.querySelectorAll('input');
  });

  module('#setValidity', function() {
    test('sets custom validity', function(assert) {
      let testValidate = () => ['test-message'];
      this.subjects.forEach(s => setValidity(s, testValidate));
      this.subjects.forEach(s => s.dispatchEvent(new FocusEvent('blur')));
      for (let input of this.subjects) {
        assert.equal(input.validationMessage, 'test-message');
        assert.strictEqual(input.validity.valid, false);
        assert.strictEqual(input.validity.customError, true);
      }
    });

    test('validates on custom events', function(assert) {
      let validationCalls = 0;
      let testValidate = () => (validationCalls++, []);
      this.subjects.forEach(s => setValidity(s, testValidate, { on: 'foobar' }));
      this.subjects.forEach(s => s.dispatchEvent(new CustomEvent('foobar')));
      assert.equal(validationCalls, 3);
    });

    test('dispatches the "validated" event', function(assert) {
      let eventCalls = 0;
      this.subjects.forEach(s => s.addEventListener('validate', () => eventCalls++));
      validate(...this.subjects);
      assert.equal(eventCalls, 3);
    });
  });

  module('#validate', function() {
    test('dispatches the "validate" event', function(assert) {
      let eventCalls = 0;
      this.subjects.forEach(s => s.addEventListener('validate', () => eventCalls++));
      validate(...this.subjects);
      assert.equal(eventCalls, 3);
    });

    test('will call validations', function(assert) {
      let validationCalls = 0;
      let testValidate = () => (validationCalls++, []);
      this.subjects.forEach(s => setValidity(s, testValidate, { on: '' }));
      validate(...this.subjects);
      assert.equal(validationCalls, 3);
    });
  });
});
