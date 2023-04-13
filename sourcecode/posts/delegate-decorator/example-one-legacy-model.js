class LegacyModel {
  constructor({ id, name }) {
    this.id = id;
    this.name = name;
  }
  save() {
    return fetch(
      `/api/users/${this.id}`,
      { method: 'PUT', body: JSON.stringify(this) }
    );
  }
  static async fetch(id) {
    let res = await fetch(`/api/users/${id}`);
    let data = await res.json();
    return new LegacyModel(data);
  }
}

// And the legacy system would have used it like this:
console.log(
  '%s: Hello %s, how are you?',
  model.id,
  model.name,
);
