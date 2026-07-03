import { flushSync } from "@/lib/core";
import { easing } from "@/lib/styles";
import { galleryStore } from "@/store/galleryStore";

export const useOverlayTransition = (animation, cb) => {
  const transition = document.startViewTransition(cb);

  // const cssEasing = getComputedStyle(document.documentElement)
  //   .getPropertyValue("--ease-out-expo")
  //   .trim(); // 공백 제거

  // 의사 요소가 생성될 때까지 기다립니다.
  transition.ready.then(animation);
};

export function stackIn(element = document.documentElement) {
  // 1. 기존 화면: 뒤로 살짝 수축하면서 어두워짐
  element.animate(
    {
      transform: ["scale(1)", "scale(0.96)"],
      filter: ["brightness(1)", "brightness(0.5)"],
    },
    {
      duration: 200,
      easing: easing("--ease-out-expo"),
      pseudoElement: "::view-transition-old(root)",
    },
  );

  // 2. 새 화면: 아래에서 위로 슬라이드 업
  element.animate(
    {
      transform: ["translateY(10vh)", "translateY(0)"],
      opacity: [0, 1],
    },
    {
      duration: 400,
      easing: easing("--ease-out-expo"),
      pseudoElement: "::view-transition-new(root)",
    },
  );
}

export function stackOut(element = document.documentElement) {
  // 1. 기존 화면: 아래로 슬라이드 다운
  element.animate(
    {
      transform: ["translateY(0)", "translateY(10vh)"],
      opacity: [1, 0],
    },
    {
      duration: 200,
      easing: easing("--ease-out-expo"),
      pseudoElement: "::view-transition-old(root)",
    },
  );
  element.animate(
    {
      transform: ["scale(0.96)", "scale(1)"],
      filter: ["brightness(0.5)", "brightness(1)"],
    },
    {
      duration: 400,
      easing: easing("--ease-out-expo"),
      pseudoElement: "::view-transition-new(root)",
    },
  );
}
