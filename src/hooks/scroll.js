export function useScroll(component, stateKey = "isHidden") {
  component.state[stateKey] = window.scrollY > 0;
  let lastScrollY = window.scrollY;

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY <= 0) {
      if (component.state[stateKey]) {
        component.setState(stateKey, false);
      }
      lastScrollY = currentScrollY;
      return;
    }

    if (currentScrollY === lastScrollY) return;

    const isScrollingUp = currentScrollY < lastScrollY;
    const shouldHide = !isScrollingUp;

    if (component.state[stateKey] !== shouldHide) {
      component.setState(stateKey, shouldHide);
    }

    lastScrollY = currentScrollY;
  };

  return handleScroll;
}