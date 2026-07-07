import { Component, define, html } from "@/lib/core";
import { scheduleStore } from "@/store/scheduleStore";
import { useJSONUpload } from "@/hooks/file";

import mapping from "./fallback.module.scss";
import raw from "./fallback.module.scss?inline";

export const Fallback = define("ky-fallback", { mapping, raw })(
  class extends Component {
    async onJSONButtonClick() {
      await useJSONUpload((data) => {
        scheduleStore.newPlan(data);
      });
    }
    template() {
      return html`
        <div class="${this.styles.fallback}">
          <img
            class="${this.styles.icon}"
            src="./fallback.svg"
            alt="파일을 등록해주세요"
          />
          <p class="${this.styles.text}">
            <slot>데이터가 없습니다.</slot>
          </p>
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
