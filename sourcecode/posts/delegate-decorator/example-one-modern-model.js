class ModernModel {
  constructor({ id, firstName, lastName }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
  }
  save() {
    throw new Error(`API hasn't been implemented yet!`);
  }
  static async fetch(id) {
    throw new Error(`API hasn't been implemented yet!`);
  }
}

// And the new system will use it like this:
console.log(
  '%s: Hello %s, with a last name of %s.',
  model.id,
  model.firstName,
  model.lastName,
);
