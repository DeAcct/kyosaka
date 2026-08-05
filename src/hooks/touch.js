//lib/hooks.js

export function useSwipe(callbacks, threshold = 10) {
  let startPos = { x: 0, y: 0 };
  let isDown = false;
  let isTriggered = false;

  return {
    start: (e) => {
      // ❌ 여기서 바로 setPointerCapture 하지 않습니다.
      isDown = true;
      isTriggered = false;
      startPos = { x: e.clientX, y: e.clientY };

      if (e.pointerType === "mouse" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
      }
    },

    move: (e) => {
      if (!isDown || isTriggered) return;

      const diffX = startPos.x - e.clientX;
      const diffY = startPos.y - e.clientY;

      // 🎯 문턱값을 넘었을 때만 캡처를 시작하고 스와이프를 실행
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        e.target.setPointerCapture(e.pointerId); // ✅ 이때 캡처!
        isTriggered = true;
        diffX > 0 ? callbacks.left?.() : callbacks.right?.();
      }
    },

    end: (e) => {
      isDown = false;
      isTriggered = false;
      // 캡처 해제는 브라우저가 자동으로 해주지만 명시적으로 할 수도 있습니다.
      if (e?.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
    },
  };
}

export const useLongPress = (
  callback,
  { delay = 600, tolerance = 10 } = {},
) => {
  let timer = null;
  let startPos = { x: 0, y: 0 };

  const start = (e) => {
    startPos = { x: e.clientX, y: e.clientY };
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      callback(e);
      if (navigator.vibrate) navigator.vibrate(50);
    }, delay);
  };

  const move = (e) => {
    if (!timer) return;

    // 🔍 미세한 떨림 이상의 움직임이 감지되면 롱프레스 취소
    const dist = Math.sqrt(
      Math.pow(e.clientX - startPos.x, 2) + Math.pow(e.clientY - startPos.y, 2),
    );
    if (dist > tolerance) clear();
  };

  const clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return {
    pointerdown: start,
    pointermove: move, // ✅ move 이벤트도 구독해야 합니다.
    pointerup: clear,
    pointerleave: clear,
  };
};
