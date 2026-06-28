import { flushSync } from "@/lib/core";
import { galleryStore } from "@/store/galleryStore";

export const useOverlayTransition = (cb) => {
  const transition = document.startViewTransition(cb);

  const cssEasing = getComputedStyle(document.documentElement)
    .getPropertyValue("--ease-out-expo")
    .trim(); // 공백 제거

  // 의사 요소가 생성될 때까지 기다립니다.
  transition.ready.then(() => {
    const easing = cssEasing || "cubic-bezier(0.32, 0.94, 0.6, 1)";

    // 1. 기존 화면: 뒤로 살짝 수축하면서 어두워짐
    document.documentElement.animate(
      {
        transform: ["scale(1)", "scale(0.96)"],
        filter: ["brightness(1)", "brightness(0.5)"],
      },
      {
        duration: 400,
        easing,
        pseudoElement: "::view-transition-old(root)",
        fill: "both",
      },
    );

    // 2. 새 화면: 아래에서 위로 슬라이드 업
    document.documentElement.animate(
      {
        transform: ["translateY(100vh)", "translateY(0)"],
      },
      {
        duration: 400,
        easing,
        pseudoElement: "::view-transition-new(root)",
        fill: "both",
      },
    );
  });
};
