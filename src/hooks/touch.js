// lib/hooks.js (또는 별도 유틸리티 파일)

/**
 * @param {string} target - 이벤트를 감지할 요소의 선택자
 * @param {Object} callbacks - { left: Function, right: Function }
 * @param {AbortSignal} signal - 메모리 누수 방지를 위한 취소 시그널
 * @param {number} threshold - 스와이프로 인정할 최소 거리 (기본값 50)
 */
// 인스턴스를 첫 번째 인자(comp)로 받습니다.
export function useSwipe(
  comp,
  target,
  { left, right },
  signal,
  threshold = 50
) {
  let start = { x: 0, y: 0 };

  // comp.addEvent를 직접 호출하므로 .call이 필요 없습니다.
  comp.addEvent(
    "touchstart",
    target,
    (e) => {
      const { screenX: x, screenY: y } = e.changedTouches[0];
      start = { x, y };
    },
    { signal }
  );

  comp.addEvent(
    "touchend",
    target,
    (e) => {
      const { screenX: x, screenY: y } = e.changedTouches[0];
      const end = { x, y };
      const diffX = start.x - end.x;
      const diffY = start.y - end.y;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        diffX > 0 ? left?.() : right?.();
      }
    },
    { signal }
  );
}
