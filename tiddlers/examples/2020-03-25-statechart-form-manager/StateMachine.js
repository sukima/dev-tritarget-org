import { Machine, assign } from 'xstate';

export function createMachine() {
  return Machine({
    id: 'example-form-manager',
    type: 'parallel',
    context: {
      canSelectNone: true,
      ip4Address: '',
      ip6Address: ''
    },
    states: {
      'addressFamily': {
        initial: 'none',
        states: {
          'ip4': {
            entry: ['setFamilyPickerToIP4', 'resetIP4Address'],
            exit: 'cacheIP4Address',
            on: {
              PICK_PROTOCOL: { target: 'ip6', cond: 'isProtocolICMP6' }
            }
          },
          'ip6': {
            entry: ['setFamilyPickerToIP6', 'resetIP6Address'],
            exit: 'cacheIP6Address',
            on: {
              PICK_PROTOCOL: { target: 'ip4', cond: 'isProtocolICMP4' }
            }
          },
          'none': {
            on: {
              PICK_PROTOCOL: [
                { target: 'ip4', cond: 'isProtocolICMP4' },
                { target: 'ip6', cond: 'isProtocolICMP6' }
              ]
            }
          }
        },
        on: {
          PICK_FAMILY: [
            { target: '.ip4', cond: 'isFamilyIP4' },
            { target: '.ip6', cond: 'isFamilyIP6' },
            { target: '.none', cond: 'canSelectNone' },
          ]
        }
      },
      'protocol': {
        initial: 'any',
        states: {
          'icmp4': {
            entry: ['lockFamilyNone', 'setProtocolPickerToICMP4'],
            exit: 'unlockFamilyNone',
            on: {
              PICK_FAMILY: { target: 'icmp6', cond: 'isFamilyIP6' }
            }
          },
          'icmp6': {
            entry: ['lockFamilyNone', 'setProtocolPickerToICMP6'],
            exit: 'unlockFamilyNone',
            on: {
              PICK_FAMILY: { target: 'icmp4', cond: 'isFamilyIP4' }
            }
          },
          'other': {},
          'any': {}
        },
        on: {
          PICK_PROTOCOL: [
            { target: '.icmp4', cond: 'isProtocolICMP4' },
            { target: '.icmp6', cond: 'isProtocolICMP6' },
            { target: '.any', cond: 'isProtocolAny' },
            { target: '.other' },
          ]
        }
      }
    }
  }, {
    actions: {
      lockFamilyNone: assign({ canSelectNone: false }),
      unlockFamilyNone: assign({ canSelectNone: true })
    },
    guards: {
      canSelectNone: ctx => ctx.canSelectNone,
      isFamilyIP4: (_, { value }) => value === 'ip4',
      isFamilyIP6: (_, { value }) => value === 'ip6',
      isFamilyNone: (_, { value }) => value === 'none',
      isProtocolICMP4: (_, { value }) => value === 'icmp4',
      isProtocolICMP6: (_, { value }) => value === 'icmp6',
      isProtocolAny: (_, { value }) => value === 'any'
    }
  });
}
