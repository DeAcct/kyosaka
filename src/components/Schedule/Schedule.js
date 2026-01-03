import { create } from "@/lib/dom";
import { switcher } from "@/lib/switcher";
import schedule from "./schedule.module.scss";
import Arrow from "@/icons/Arrow";
import RouteCard from "../RouteCard/RouteCard";

// import mock from "../../mock.json";

export default function Schedule(dayIndex) {
  const _data = localStorage.getItem("myKyotoTrip");
  const data = JSON.parse(_data);
  const day = data[dayIndex];

  // if (!day) {
  //   fallback.classList.add("Fallback--Hidden");
  // }

  function getIcon(item) {
    return switcher(item.type)
      .case((type) => type === "transport", "🚅")
      .case((type) => type === "sightseeing", "📍")
      .case((type) => type === "hotel", "🏨")
      .case((type) => type === "food", "🍣")
      .default(() => "❤️");
  }

  const template = `${day.schedule
    .map(
      (item, index) => `
    <details name="itinerary" class="${schedule.schedule}" ${
        index === 0 ? "open" : ""
      }>
      <summary class="${schedule.shrink}">
        <i class="${schedule.icon}">${getIcon(item)}</i>
        <div class="${schedule.text}">
          <h2 class="${schedule.name}">${item.name}</h2>
          <p class="${schedule.time}">${item.time.from} ~ ${item.time.to}</p>
        </div>
        <i class="${schedule.arrow}">
          ${Arrow()}
        </i>
      </summary>
      
      <div class="${schedule.content}">
        ${item.route ? RouteCard(item.route) : ""}
        <ul class="desc-box">
          ${item.description.map((desc) => `<li>• ${desc}</li>`).join("")}
        </ul>
        <section>
          <h3 class="${schedule.title}"></h3>
          <ul class="photo-section">
            <li>
              <div class="photo-placeholder" id="img-${dayIndex}-${index}">
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onchange="uploadImage(event, '${dayIndex}-${index}')" 
                id="file-${dayIndex}-${index}" 
                hidden
              />
              <button class="btn-upload" 
              onclick="document.getElementById('file-${dayIndex}-${index}').click()">
              사진 추가
              </button>
            </li>
          </ul>
        </section>
      </div>
    </details>
  `
    )
    .join("")}
    <p class="${schedule.fallback}">일정을 누르면 여기에 열립니다</p>`;

  return create(template);
}
