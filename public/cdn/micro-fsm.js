const STOPPED = Symbol('stopped');

export function transitionMachine(machine, { value: currentState } = {}, event) {
  ({ type: event = event } = event);
  const A = i => Array.isArray(i) ? i : [i];
  let state = currentState ?? machine.initial;
  let transition = machine.states[state].on?.[event] ?? machine.on?.[event] ?? { target: state };
  let value = transition?.target ?? transition;
  let changed = value !== currentState;
  let actions = [
    ...(changed ? A(machine.states[currentState]?.exit ?? []) : []),
    ...A(transition.actions ?? []),
    ...(changed ? A(machine.states[value]?.entry ?? []) : [])
  ];
  let states = value.split(':');
  let inState = states.reduce((a, i) => ({ ...a, [i]: true }), {});
  return { value, changed, actions, states, inState };
}

export function interpret(machine, actions = {}) {
  let listeners = new Set();
  let service = {
    state: STOPPED,
    send(evt, extra = {}) {
      if (service.state === STOPPED) { return service; }
      let event = { ...extra, ...(evt.type ? evt : { type: evt }) };
      service.state = transitionMachine(machine, service.state, event);
      service.state.actions.forEach(action => actions[action]?.(event));
      listeners.forEach(listener => listener(service.state, event));
      return service;
    },
    onTransition(cb) {
      listeners.add(cb);
      return service;
    },
    start() {
      if (service.state === STOPPED) {
        service.state = undefined;
        service.send('#init');
      }
      return service;
    },
    stop() {
      service.state = STOPPED;
      listeners.clear();
      return service;
    }
  };
  return service;
}
