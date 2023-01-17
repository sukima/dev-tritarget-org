const light = document.getElementById('light');

function startBlinker() {
  const toggleBlink = () => light.classList.toggle('on');
  let interval = setInterval(toggleBlink, 700);
  return () => {
    clearInterval(interval);
    light.classList.add('on');
  };
}

const trafficLight = interpret(lightMachine.withConfig({
  actions: {
    setColorRed: () => light.dataset.color = 'red',
    setColorYellow: () => light.dataset.color = 'yellow',
    setColorGreen: () => light.dataset.color = 'green',
  },
  services: {
    blinkerRelay: () => () => startBlinker(),
  },
})).start();
