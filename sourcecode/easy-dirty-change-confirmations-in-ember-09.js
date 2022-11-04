export default MyRoute extends Route {
  async model() { … }

  @action
  async willTransition(transition) {
    let { unloader } = this.modelFor(this.routeName);

    if (!unloader.hasChanges) return;
    transition.abort();
    let { reason } = await unloader.confirmAbandonChanges();
    if (reason === 'confirmed') transition.retry();
  }
}
