// Please don’t try to do something like this
interpret(createMachine({
  initial: '…',
  context: { model: null },
  on: {
    MODEL: { actions: 'assignModel' },
  },
  states: { … },
}, {
  actions: {
    assignModel: assign({
      model: (_, event) => event.model,
    }),
  },
}))
  .onTransition((state) => {
    doSomethingWith(state.context.model);
  })
  .start();
