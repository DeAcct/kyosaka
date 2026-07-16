import { Component, define, html } from "@/lib/core";
import mapping from "./yoloBox.module.scss";
import raw from "./yoloBox.module.scss?inline";

import "@/components/Input/Input";
import "@/components/Icon/Icon";

export const YoloBox = define("yolo-box", { mapping, raw })(
  class extends Component {
    setup() {
      this.state = {
        prompt: "",
      };
    }

    onPropsPatchComplete() {
      if (this.isConnected) {
        this.render();
      }
    }

    handleInputChange(e) {
      this.setState("prompt", e.detail.value);
    }

    handleSubmit() {
      const promptText = this.state.prompt.trim();
      console.log("click");
      if (!promptText) return;
      this.emit("yolo", { detail: { prompt: promptText } });
    }

    clear() {
      this.setState("prompt", "");
    }

    template() {
      const isLoading = this.loading || this.getAttribute("loading") === "true";

      return html`
        <div class="${this.styles.yoloContainer}">
          <ky-input
            class="${this.styles.yoloInput}"
            value="${this.state.prompt}"
            placeholder="AI에게 하루 일정 부탁하기 (예: 오사카 힐링 온천 하루 일정)"
            @change="${(e) => {
              this.handleInputChange(e);
            }}"
          ></ky-input>
          <button
            type="button"
            class="${this.styles.yoloButton}"
            @click="${this.handleSubmit}"
            ${isLoading ? "disabled" : ""}
          >
            <ky-icon
              name="dice"
              class="${this.styles.yoloIcon} ${isLoading
                ? this.styles.spin
                : ""}"
            ></ky-icon>
          </button>
        </div>
      `;
    }
  },
);
