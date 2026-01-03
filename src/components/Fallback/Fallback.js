import ImportJSON from "@/components/ImportJSON/ImportJSON";
import "./fallback.scss";

export default function Fallback() {
  const template = `
      <img src="./fallback.svg">
      <p class="Fallback__Text">등록된 여행 일정이 없습니다.</p>
  `;

  const $root = document.createElement("div");
  $root.innerHTML = template;
  $root.classList.add("Fallback");
  $root.appendChild(ImportJSON());

  return $root;
}
