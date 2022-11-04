function interpret(machine, actions = {}) {
  const STOPPED = Symbol('stopped');
  let listeners = new Set();
  let service = {
    state: STOPPED,
    send(evt, extra = {}) {
      if (service.state === STOPPED) { return service; }
      let event = {
        ...extra,
        ...(evt.type ? evt : { type: evt }),
      };
      service.state =
        transitionMachine(machine, service.state, event);
      service.state.actions.forEach(
        action => actions[action]?.(event),
      );
      listeners.forEach(
        listener => listener(service.state, event),
      );
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
