function transitionMachine(
  machine,
  state = machine.initial,
  event
) {
  return machine.states[state].on?.[event]
    ?? machine.on?.[event]
    ?? state;
}
