function transitionMachine(
  machine,
  { value: currentState } = {},
  event
) {
  ({ type: event = event } = event);
  const A = i => Array.isArray(i) ? i : [i];
  let state = currentState ?? machine.initial;
  let transition = machine.states[state].on?.[event]
    ?? machine.on?.[event]
    ?? { target: state };
  let value = transition?.target ?? transition;
  let changed = value !== currentState;
  let actions = [
    ...(
      changed
        ? A(machine.states[currentState]?.exit ?? [])
        : []
    ),
    ...A(transition.actions ?? []),
    ...(
      changed
        ? A(machine.states[value]?.entry ?? [])
        : []
    )
  ];
  let states = value.split(':');
  let inState = states.reduce(
    (a, i) => ({ ...a, [i]: true }),
    {}
  );
  return { value, changed, actions, states, inState };
}
