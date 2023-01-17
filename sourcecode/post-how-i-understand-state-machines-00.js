createMachine({
  initial: 'solid',
  states: {
    solid: {
      initial: 'red',
      on: {
        FAIL: '#blinking.red',
        CAUTION: '#blinking.yellow',
      },
      states: {
        red: {
          entry: 'setColorRed',
          on: { NEXT: 'yellow' },
        },
        yellow: {
          entry: 'setColorYellow',
          on: { NEXT: 'green' },
        },
        green: {
          entry: 'setColorGreen',
          on: { NEXT: 'red' },
        },
      },
    },
    blinking: {
      id: 'blinking',
      invoke: { src: 'blinkerRelay' },
      on: { NEXT: 'solid' },
      states: {
        red: {
          entry: 'setColorRed',
          on: { CAUTION: 'yellow' },
        },
        yellow: {
          entry: 'setColorYellow',
          on: { FAIL: 'red' },
        },
      },
    },
  },
});
