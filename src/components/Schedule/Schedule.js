import { create } from "../../lib/dom";
import "./schedule.scss";

// import mock from "../../mock.json";

export default function Schedule(dayIndex) {
  const _data = localStorage.getItem("myKyotoTrip");
  const data = JSON.parse(_data);
  const day = data[dayIndex];

  // if (!day) {
  //   fallback.classList.add("Fallback--Hidden");
  // }

  const template = day.schedule
    .map(
      (item, index) => `
    <details name="itinerary" class="schedule-item">
      <summary>
        <div class="summary-left">
          <span class="time">${item.time.from}</span>
          <strong>${item.name}</strong>
        </div>
        <span class="type-icon">${
          item.type === "transport" ? "🚅" : "📍"
        }</span>
      </summary>
      
      <div class="detail-panel">
        <h3>${item.name}</h3>
        <div class="meta">시간: ${item.time.from} ~ ${item.time.to}</div>
        
        <div class="photo-section">
          <div class="photo-placeholder" id="img-${dayIndex}-${index}">
            </div>
          <input type="file" accept="image/*" 
            onchange="uploadImage(event, '${dayIndex}-${index}')" 
            id="file-${dayIndex}-${index}" hidden>
          <button class="btn-upload" 
            onclick="document.getElementById('file-${dayIndex}-${index}').click()">
            사진 추가
          </button>
        </div>

        <div class="desc-box">
          ${item.description.map((desc) => `<p>• ${desc}</p>`).join("")}
        </div>
      </div>
    </details>
  `
    )
    .join("");

  return create(template);
}
