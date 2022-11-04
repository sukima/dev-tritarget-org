export default MyRoute extends Route {
  async model() {
    let data = await loadMyData();
    let unloader = new UnloadManager;
    return { data, unloader };
  }
}
