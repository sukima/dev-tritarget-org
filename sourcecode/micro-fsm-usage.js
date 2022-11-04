const MACHINE = {
  initial: 'off',
  on: {
    TURN_OFF: { target: 'off', actions: 'turnOffDevice' }
  },
  states: {
    off: {
      exit: 'turnOnDevice',
      on: { TURN_ON: 'red' }
    },
    red: {
      entry: ['setColorRed', 'soundWarningAlarm'],
      on: { NEXT: 'green' }
    },
    yellow: {
      entry: 'setColorYellow',
      on: { NEXT: 'red' }
    },
    green: {
      entry: 'setColorGreen',
      on: { NEXT: 'yellow' }
    }
  }
};

let trafficService = interpret(MACHINE, {
  turnOffDevice: () => …,
  turnOnDevice: () => …,
  setColorRed: () => …,
  setColorYellow: () => …,
  setColorGreen: () => …,
  soundWarningAlarm: () => …
})
  .onTransition(({ value }) => console.log(value))
  .start();

trafficService.send('TURN_ON');  // => 'red'
trafficService.send('NEXT');     // => 'green'
trafficService.send('NEXT');     // => 'yellow'
trafficService.send('NEXT');     // => 'red'
trafficService.send('TURN_OFF'); // => 'off'
