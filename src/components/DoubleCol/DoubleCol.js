import Fallback from "@/components/Fallback/Fallback";
import Schedule from "@/components/Schedule/Schedule";
import { create } from "@/lib/dom";
import doubleCol from "./doubleCol.module.scss";

export default function DoubleCol() {
  // 1. 실제 DOM에 붙을 고정적인 래퍼(Wrapper)를 만듭니다.
  const $wrapper = create(`<main class="${doubleCol.doubleCol}"></main>`);
  const $container = $wrapper.firstChild; // 실제 div 요소 추출

  // 2. 상태에 따라 내부를 다시 그리는 함수
  const update = (index) => {
    $container.innerHTML = ""; // 기존 내용 싹 비우기
    const data = localStorage.getItem("myKyotoTrip");

    if (!data) {
      $container.appendChild(Fallback());
      return;
    }
    const currentDay = localStorage.getItem("selectedDay") || 0;
    if (typeof currentDay === "object") {
      localStorage.setItem("selectedDay", 0);
    }
    // 탭 인덱스 상태는 전역이나 클로저로 관리 가능
    $container.appendChild(Schedule(currentDay));
  };

  // 3. 커스텀 이벤트를 구독합니다.
  // 다른 곳(ImportJSON 등)에서 데이터를 넣고 'RENDER' 이벤트를 쏘면 실행됩니다.
  window.addEventListener("RENDER", update);

  update(); // 초기 실행
  return $wrapper;
}
