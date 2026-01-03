import { $, create } from "@/lib/dom";
import { readJSONFile } from "@/lib/file";
import style from "./importJSON.module.scss";

export default function ImportJSON() {
  const template = `
    <input type="file" id="ImportJSON" hidden />
    <button class="${style.importJSON}" type="button" data-ref="ImportJSON">불러오기</button>
  `;

  console.log(template);

  // 1. Range 객체를 사용하여 문자열을 Fragment로 즉시 변환 (wrap 없음)
  const $fragment = create(template);

  // 2. Fragment 내부에서 요소 찾아 이벤트 걸기
  const $input = $fragment.querySelector("#ImportJSON");
  const $button = $fragment.querySelector("[data-ref='ImportJSON']");

  $button.addEventListener("click", () => {
    $input.click();
  });

  $input.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const tripData = await readJSONFile(file);
      localStorage.setItem("myKyotoTrip", JSON.stringify(tripData));
      window.dispatchEvent(new CustomEvent("RENDER"));
    } catch (error) {
      console.log(error);
    } finally {
      e.target.value = "";
    }
  });

  // 3. Fragment 자체를 반환 (DOM에 추가될 때 내부 요소들만 들어감)
  return $fragment;
}
