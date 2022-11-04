let { reason, value: formData } = await manager.open();
if (reason === 'confirmed') {
  console.log(`Hello ${formData.get('foobar')}!`);
}
