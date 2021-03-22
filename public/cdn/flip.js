// https://css-tricks.com/animating-layouts-with-the-flip-technique/
// Don't forget CSS `transition: transform …;` on the element.
export function flipAnimate(element, updateFn) {
  return new Promise(resolve => {
    let before = element.getBoundingClientRect();
    updateFn({ element, before });
    let after = element.getBoundingClientRect();
    let deltas = {
      left: before.left - after.left,
      top: before.top - after.top,
      width: before.width / after.width,
      height: before.height / after.height,
    };
    element.style.transition = 'none';
    element.style.transform = `
      translate(${deltas.left}px, ${deltas.top}px)
      scale(${deltas.width}, ${deltas.height})
    `;
    requestAnimationFrame(() => {
      element.style.transition = '';
      element.style.transform = '';
      resolve({ element, before, after, deltas });
    });
  });
}
