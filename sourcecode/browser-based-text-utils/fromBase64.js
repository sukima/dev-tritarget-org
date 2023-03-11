async function fromBase64(str) {
	let prefix = 'data:application/octet-stream;base64,';
	let res = await fetch(prefix + str);
	return new Uint8Array(await res.arrayBuffer());
}
