export default {
  // If anyone has a shrotcut set with Control,
  // set the secondaryCommand to Meta
  0: (state) => {
    const newProperties = { metaKey: false };
    const selectKbd = (key, f = (x) => x) => f(state.keyboard[key]);
    const selectKbdCommand = (key) => selectKbd(key, (x) => x.command);
    const newKbdCommand = (kbdCmd) => Object.assign({}, kbdCmd, newProperties);
    const makeMetaComplement = (kbdCmd) =>
      Object.assign({}, newKbdCommand(kbdCmd), {
        ctrlKey: false,
        metaKey: kbdCmd.ctrlKey,
      });
    return Object.assign({}, state, {
      keyboard: Object.keys(state.keyboard).reduce(
        (kbdAcc, key) =>
          Object.assign(kbdAcc, {
            [key]: Object.assign({}, selectKbd(key), {
              command: newKbdCommand(selectKbdCommand(key)),
              secondaryCommand: selectKbdCommand(key).ctrlKey
                ? makeMetaComplement(selectKbdCommand(key))
                : null,
            }),
          }),
        {}
      ),
    });
  },
};
