import { trackChanges, changeSummary } from '../change-tracking.js';

const { module, test } = QUnit;

module('change-tracking.js', function() {
  test('tracks changes of a target', function(assert) {
    let testObject = { foo: 'FOO1', bar: 'BAR1' };
    let subject = trackChanges(testObject);

    subject.foo = 'FOO2';
    subject.foo = 'FOO3';

    assert.deepEqual(testObject, { foo: 'FOO3', bar: 'BAR1' });
    assert.deepEqual(changeSummary(subject), [{ prop: 'foo', from: 'FOO1', to: 'FOO3' }]);
    assert.deepEqual(changeSummary(testObject), [{ prop: 'foo', from: 'FOO1', to: 'FOO3' }]);
  });
});
