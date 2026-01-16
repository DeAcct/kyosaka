//lib/hooks.js

export function useSwipe(callbacks, threshold = 5) {
  let startPos = { x: 0, y: 0 };
  let isDown = false;
  let isTriggered = false;

  return {
    start: (e) => {
      e.target.setPointerCapture(e.pointerId);
      isDown = true;
      isTriggered = false;
      startPos = { x: e.screenX, y: e.screenY };

      if (e.pointerType === "mouse") e.preventDefault();
    },

    move: (e) => {
      if (!isDown || isTriggered) return;

      const diffX = startPos.x - e.screenX;
      const diffY = startPos.y - e.screenY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        isTriggered = true;
        diffX > 0 ? callbacks.left?.() : callbacks.right?.();
      }
    },

    end: () => {
      isDown = false;
      isTriggered = false;
    },
  };
}

// src/hooks/useLongPress.js
export const useLongPress = (callback, { delay = 600 } = {}) => {
  let timer = null;

  const start = (e) => {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      callback(e);
      if (navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch (err) {
          console.warn("Vibration blocked by browser policy", err);
        }
      }
    }, delay);
  };

  const clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return {
    pointerdown: start,
    pointerup: clear,
    pointerleave: clear,
    contextmenu: (e) => e.preventDefault(),
  };
};
