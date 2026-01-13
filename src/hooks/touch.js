// lib/hooks.js

export function useSwipe(callbacks, threshold = 5) {
  let startPos = { x: 0, y: 0 };
  let isDown = false;
  let isTriggered = false; // 한 번의 스와이프에 한 번만 실행되도록 제어

  return {
    start: (e) => {
      e.target.setPointerCapture(e.pointerId);
      // 🔍 모든 입력(마우스/터치)을 pointerdown 하나로 처리
      isDown = true;
      isTriggered = false;
      startPos = { x: e.screenX, y: e.screenY };

      // 마우스의 경우 텍스트 선택이나 드래그 방지
      if (e.pointerType === "mouse") e.preventDefault();
    },

    move: (e) => {
      if (!isDown || isTriggered) return;

      const diffX = startPos.x - e.screenX;
      const diffY = startPos.y - e.screenY;
      // 🔍 가로 이동 거리가 세로보다 크고 임계값을 넘었을 때만 작동
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        isTriggered = true; // 실행됨으로 표시
        diffX > 0 ? callbacks.left?.() : callbacks.right?.();
      }
    },

    end: () => {
      isDown = false;
      isTriggered = false;
    },
  };
}
