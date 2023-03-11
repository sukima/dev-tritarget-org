function toBinary(str) {
	return new TextEncoder().encode(str)
}

function fromBinary(binary) {
	return new TextDecoder().decode(binary);
}
