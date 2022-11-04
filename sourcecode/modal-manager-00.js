let { reason } = await modalManager.open();
switch (reason) {
  case 'cancelled': …;
  case 'confirmed': …;
  case 'rejected': …;
}
