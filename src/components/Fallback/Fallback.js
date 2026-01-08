import { Component, define } from "@/lib/dom";
import { getFileFromPrompt, readJSONFile } from "@/lib/file";
import { scheduleStore } from "@/store/scheduleStore";

import mapping from "./fallback.module.scss";
import raw from "./fallback.module.scss?inline";

import { Button } from "@/components/Button/Button";

export const Fallback = define("ky-fallback", { mapping, raw })(
  class extends Component {
    // setup(){
    //   this.subscribe(travelData);
    // }

    getStyles() {
      return {
        mapping,
        stylesheet,
      };
    }
    template() {
      return `
      <div class="${this.styles.fallback}">
        <img class="${this.styles.icon}" src="./fallback.svg" alt="파일을 등록해주세요">
        <p class="${this.styles.text}">등록된 여행 일정이 없습니다.</p>
        <ky-button>불러오기</ky-button>
      </div>
    `;
    }
    initEventListeners(signal) {
      this.addEvent("ky-click", "ky-button", this.onJSONButtonClick, {
        signal,
      });
    }

    async onJSONButtonClick(e) {
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
        // localStorage.setItem("myKyotoTrip", JSON.stringify(tripData));
        window.dispatchEvent(new CustomEvent("RENDER"));
      } catch (error) {
        console.log(error);
      } finally {
        e.target.value = "";
      }
    }
  }
);
