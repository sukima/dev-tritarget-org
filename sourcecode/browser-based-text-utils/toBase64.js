async function toBase64(binary) {
	let dataUrl = await new Promise(resolve => {
		let reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.readAsDataURL(new Blob([binary]));
	});

	// removes prefix "data:application/octet-stream;base64,"
	return dataUrl.slice(37);
}
