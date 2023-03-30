function fromPointer(array, pointer) {
  let size = array.length;
  let boundIndex = ((pointer % size) + size) % size;
  return array[boundIndex];
}
