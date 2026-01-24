import { Component, define, html } from "@/lib/core";
import { getFileFromPrompt, readJSONFile } from "@/lib/file";
import { scheduleStore } from "@/store/scheduleStore";

import mapping from "./fallback.module.scss";
import raw from "./fallback.module.scss?inline";

export const Fallback = define("ky-fallback", { mapping, raw })(
  class extends Component {
    async onJSONButtonClick() {
      try {
        const file = await getFileFromPrompt({
          types: [
            {
              description: "계획표 파일",
              accept: { "application/json": [".json"] },
            },
          ],
          multiple: false,
        });
        if (!file) return;

        const tripData = await readJSONFile(file);
        scheduleStore.commit("list", tripData);
      } catch (error) {
        console.log(error);
      }
    }
    template() {
      return html`
        <div class="${this.styles.fallback}">
          <img
            class="${this.styles.icon}"
            src="./fallback.svg"
            alt="파일을 등록해주세요"
          />
          <p class="${this.styles.text}">등록된 여행 일정이 없습니다.</p>
          <button
            @click="${(e) => {
              this.onJSONButtonClick();
            }}"
            type="button"
            class="${this.styles.button}"
          >
            불러오기
          </button>
        </div>
      `;
    }
  },
);
