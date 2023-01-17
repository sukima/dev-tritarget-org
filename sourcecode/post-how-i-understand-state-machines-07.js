createMachine({
  initial: 'idle',
  context: { pressCount: 0 },
  states: {
    idle: {
      on: {
        PRESS: [
          { target: 'boom', cond: 'hasReachedPressLimit' },
          { actions: 'incPressCount' },
        ],
      },
    },
    boom: { type: 'final' },
  },
}, {
  guards: {
    hasReachedPressLimit:
      (ctx) => ctx.pressCount >= PRESS_LIMIT,
  },
  actions: {
    incPressCount: assign({
      pressCount: (ctx) => ctx.pressCount + 1,
    }),
  },
});
