import QUNIT_CSS from './node_modules/qunit/qunit/qunit.css';
import QUnit from 'qunit';
import sinon from 'sinon';
import * as xstate from 'xstate';
import * as xstateTest from '@xstate/test';

export { QUnit, sinon, xstate, xstateTest };

export function testWrapper(testFn) {
  return function (testContext, state) {
    QUnit.assert.ok(
      true,
      `§ Testing state ${JSON.stringify(state.value)} ` +
      `← event ${JSON.stringify(state.event)}`,
    );
    return testFn(testContext, state);
  };
};

sinon.assert.pass = (assertion) => QUnit.ok(true, assertion);
sinon.assert.fail = (assertion) => QUnit.ok(false, assertion);
sinon.assert.expose(QUnit.assert, { prefix: '' });
QUnit.testDone(() => sinon.restore());

function setupDOM({ id, content = '', tag = 'div' }) {
  if (document.getElementById(id)) return;
  let el = document.createElement(tag);
  el.id = id;
  el.innerHTML = content;
  document.body.appendChild(el);
}

setupDOM({ id: 'qunit-css', content: QUNIT_CSS, tag: 'style' });
setupDOM({ id: 'qunit' });
setupDOM({ id: 'qunit-fixture' });
