class CallbackModalManager extends ModalManager {
  #onDone = () => {};
  #onCancelled = () => {};
  #onConfirmed = () => {};
  #onRejected = () => {};
  #onError = () => {};

  constructor({
    onDone,
    onCancelled,
    onConfirmed,
    onRejected,
    onError,
  } = {}) {
    this.#onDone = onDone ?? this.#onDone;
    this.#onCancelled = onCancelled ?? this.#onCancelled;
    this.#onConfirmed = onConfirmed ?? this.#onConfirmed;
    this.#onRejected = onRejected ?? this.#onRejected;
    this.#onError = onError ?? this.#onError;
  }

  @action
  async open() {
    let result;
    try {
      result = await super.open();
    } catch (error) {
      this.#onError(error);
      throw error;
    }
    this.#onDone(result);
    if (result === 'cancelled')
      this.#onCancelled();
    if (result === 'confirmed')
      this.#onConfirmed(result.value);
    if (result === 'reject')
      this.#onRereject(result.value);
  }
}

export default helper(
  (_, callbacks) => new CallbackModalManager(callbacks),
);
