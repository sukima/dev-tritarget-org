export default class FooBar extends Component {
  manager = new ModalManager();

  @action
  async openModal() {
    let result = await this.manager.open();
    if (result.reason !== 'confirmed') return;
    console.log('Works!');
  }
}
