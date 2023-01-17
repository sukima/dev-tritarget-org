const light = document.getElementById('light');

interpret(createMachine({
  initial: 'red',
  states: {
    red: { … },
    yellow: { … },
    green: { … },
  },
}))
  .onTransition((state) => {
    light.dataset.state = state.toStrings().join(' ');
  })
  .start();
