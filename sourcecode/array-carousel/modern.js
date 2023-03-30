function fromPointer(array, pointer) {
  return array.at(pointer % array.length);
}
