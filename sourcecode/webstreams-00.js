uploadField.addEventListener('change', async () => {
  let [file] = uploadField.files;
  if (!file) return;
  let text = await file.text();
  renderLines(text.split('\n'));
});
