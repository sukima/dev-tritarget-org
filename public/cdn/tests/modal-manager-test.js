import $ from '../simple-dom.js';
import ModalManager, { ModalDialogController } from '../modal-manager.js';
import { sinon } from '../testing.js';

const { module, test } = QUnit;

module('modal-manager.js', function() {
  module('ModalManager', function() {
    test('manages isOpen flag', async function(assert) {
      let subject = new ModalManager();
      assert.false(subject.isOpen, 'isOpen false');
      let resultPromise = subject.open();
      assert.true(subject.isOpen, 'isOpen troue');
      subject.cancel();
      await resultPromise;
      assert.false(subject.isOpen, 'isOpen false');
    });

    test('can be cancelled', async function(assert) {
      let subject = new ModalManager();
      let resultPromise = subject.open();
      subject.cancel();
      let { reason } = await resultPromise;
      assert.equal(reason, 'cancelled');
    });

    test('can be confirmed', async function(assert) {
      let subject = new ModalManager();
      let resultPromise = subject.open();
      subject.confirm('test-value');
      let { reason, value } = await resultPromise;
      assert.equal(reason, 'confirmed');
      assert.equal(value, 'test-value');
    });

    test('can be rejected', async function(assert) {
      let subject = new ModalManager();
      let resultPromise = subject.open();
      subject.reject('test-value');
      let { reason, value } = await resultPromise;
      assert.equal(reason, 'rejected');
      assert.equal(value, 'test-value');
    });

    test('can be errored', async function(assert) {
      let subject = new ModalManager();
      let resultPromise = subject.open();
      subject.error(new Error('test-error'));
      await assert.rejects(resultPromise, /test-error/);
    });

    test('can delegate opening and closing', async function(assert) {
      let testController = new ModalDialogController();
      let openStub = sinon.stub(testController, 'open');
      let closeStub = sinon.stub(testController, 'close');
      let subject = new ModalManager();
      subject.delegateTo(testController);
      let resultPromise = subject.open();
      subject.cancel();
      await resultPromise;
      assert.callOrder(openStub, closeStub);
    });

    test('provides a factory method', async function(assert) {
      let testController = new ModalDialogController();
      let mockFactory = sinon.stub().returns(testController);
      let testElement = document.createElement('dialog');
      let subject = ModalManager.for(testElement, mockFactory);
      assert.calledWith(mockFactory, testElement, subject);
    });
  });

  module('ModalDialogController', function(hooks) {
    hooks.beforeEach(function() {
      this.$fixture = $['#qunit-fixture'];
      this.$fixture.innerHTML = `
        <dialog id="test-subject">
          <form method="dialog"><button type="submit" name="foo" value="bar"></button</form>
          <button type="button" data-action="cancel"></button>
          <button type="button" data-action="confirm"></button>
          <button type="button" data-action="confirm" data-value="test-confirm"></button>
          <button type="button" data-action="reject"></button>
          <button type="button" data-action="reject" data-value="test-reject"></button>
        </dialog>
      `;
      this.$testDialog = this.$fixture['test-subject'];
      this.manager = new ModalManager();
      this.subject = new ModalDialogController(this.$testDialog.element, this.manager);
      sinon.stub(this.manager, 'cancel');
      sinon.stub(this.manager, 'confirm');
      sinon.stub(this.manager, 'reject');
      this.subject.open();
    });

    hooks.afterEach(function() {
      this.$fixture.innerHTML = '';
    });

    test('opens dialog', function(assert) {
      assert.true(this.$testDialog.hasAttribute('open'), 'is opened');
    });

    test('closes dialog', function(assert) {
      this.subject.close();
      assert.false(this.$testDialog.hasAttribute('open'), 'is closed');
    });

    test('can cancel dialog', function(assert) {
      this.$testDialog['[data-action=cancel]'].click();
      this.$testDialog.dispatchEvent(new CustomEvent('cancel'));
      assert.calledTwice(this.manager.cancel);
    });

    test('can confirm dialog', function(assert) {
      this.$testDialog.element.returnValue = 'test-returnValue-confirm';
      this.$testDialog['[data-action=confirm]'].click();
      this.$testDialog['[data-action=confirm][data-value]'].click();
      assert.calledTwice(this.manager.confirm);
      assert.calledWith(this.manager.confirm, 'test-returnValue-confirm');
      assert.calledWith(this.manager.confirm, 'test-confirm');
    });

    test('can reject dialog', function(assert) {
      this.$testDialog.element.returnValue = 'test-returnValue-reject';
      this.$testDialog['[data-action=reject]'].click();
      this.$testDialog['[data-action=reject][data-value]'].click();
      assert.calledTwice(this.manager.reject);
      assert.calledWith(this.manager.reject, 'test-returnValue-reject');
      assert.calledWith(this.manager.reject, 'test-reject');
    });

    test('can form submit dialog', function(assert) {
      this.$testDialog['button[type=submit]'].click();
      assert.calledWith(this.manager.confirm, sinon.match.instanceOf(FormData));
    });
  });
});
