export const easing = (easingName) =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(easingName)
    .trim(); //
