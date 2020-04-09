import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { createMachine } from '../utils/-state-machine';
const { interpret, assign } = XState;

export default class extends Component {

  @tracked state;

  get guid() {
    return guidFor(this);
  }

  get stateStrings() {
    return this.state.toStrings().join(' ');
  }

  get stateList() {
    return this.state.toStrings().join(', ');
  }

  get isNoneDisabled() {
    return !this.state.context.canSelectNone;
  }

  constructor() {
    super(...arguments);
    let actions = {
      resetIP4Address: ctx => this.address.value = ctx.ip4Address,
      resetIP6Address: ctx => this.address.value = ctx.ip6Address,
      cacheIP4Address: assign({ ip4Address: () => this.address.value }),
      cacheIP6Address: assign({ ip6Address: () => this.address.value }),
      setFamilyPickerToIP4: () => this.family.value = 'ip4',
      setFamilyPickerToIP6: () => this.family.value = 'ip6',
      setProtocolPickerToICMP4: () => this.protocol.value = 'icmp4',
      setProtocolPickerToICMP6: () => this.protocol.value = 'icmp6'
    };
    this.machine = interpret(createMachine().withConfig({ actions }));
    this.machine
      .onTransition(state => this.state = state)
      .start();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.machine.stop();
  }

  @action
  transition(eventName, event) {
    let { target: { value } } = event;
    this.machine.send(eventName, { value });
  }

}