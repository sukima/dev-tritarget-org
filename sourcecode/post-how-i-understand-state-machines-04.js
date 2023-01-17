const log = (...args) => console.log(...args);

const consoleLight = interpret(lightMachine.withConfig({
  actions: {
    setColorRed: () => log('Set color to Red'),
    setColorYellow: () => log('Set color to Yellow'),
    setColorGreen: () => log('Set color to Green'),
  },
  services: {
    blinkerRelay: () => () => {
      log('started blinking');
      return () => log('stopped blinking');
    },
  },
})).start();
