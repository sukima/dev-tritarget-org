function mockConfig(assert) {
  return {
    actions: {
      setColorRed: () => assert.step('red'),
      setColorYellow: () => assert.step('yellow'),
      setColorGreen: () => assert.step('green'),
    },
    services: {
      blinkerRelay: () => () => {
        assert.step('start blinking');
        return () => assert.step('stop blinking');
      },
    },
  };
}

module('Traffic Light', function () {
  test('cycles the light', function (assert) {
    let config = mockConfig(assert);
    let machine = lightMachine.withConfig(config);
    let subject = interpret(machine);
    subject.start();
    subject.send(['NEXT', 'NEXT', 'NEXT']);
    assert.verifySteps(['red', 'yellow', 'green', 'red']);
  });
});
