const color = document.querySelector('#text .color');
const blinker = document.querySelector('#text .blinker');

const textLight = interpret(lightMachine.withConfig({
  actions: {
    setColorRed: () => color.textContent = 'red',
    setColorYellow: () => color.textContent = 'yellow',
    setColorGreen: () => color.textContent = 'green',
  },
  services: {
    blinkerRelay: () => () => {
      blinker.textContent = '(blinking)';
      return () => blinker.textContent = '';
    },
  },
})).start();
