// lib/utils.js
export const createScheduler = (callback) => {
  let rafId = null;

  const prevSchedule = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const schedule = () => {
    if (rafId) return; // 이미 예약된 프레임이 있으면 무시

    rafId = requestAnimationFrame(() => {
      callback();
      rafId = null;
    });
  };

  // 취소 기능이 필요할 수 있으므로 함께 반환
  return { schedule, cancel: prevSchedule };
};
