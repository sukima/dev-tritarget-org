const MACHINE = {
  initial: 'off',
  on: { TURN_OFF: 'off' },
  states: {
    off: { on: { TURN_ON: 'red' } },
    red: { on: { NEXT: 'green' } },
    yellow: { on: { NEXT: 'red' } },
    green: { on: { NEXT: 'yellow' } }
  }
};

let state = MACHINE.initial;
// => 'off'
state = transitionMachine(MACHINE, state, 'TURN_ON');
// => 'red'
state = transitionMachine(MACHINE, state, 'NEXT');
// => 'green'
state = transitionMachine(MACHINE, state, 'NEXT');
// => 'yellow'
state = transitionMachine(MACHINE, state, 'NEXT');
// => 'red'
state = transitionMachine(MACHINE, state, 'TURN_OFF');
// => 'off'
