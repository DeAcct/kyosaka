import { Component, define, html, flushSync } from "@/lib/core";
import { galleryStore } from "@/store/galleryStore";
import { useOverlayTransition, stackOut } from "@/hooks/overlayMotion";

import { Icon } from "@/components/Icon/Icon";

import mapping from "./memoryOverlay.module.scss";
import raw from "./memoryOverlay.module.scss?inline";

export const MemoryOverlay = define("memory-overlay", { mapping, raw })(
  class extends Component {
    state = {
      infoVisible: true,
    };

    closeOverlay() {
      useOverlayTransition(stackOut, () => {
        flushSync(() => {
          galleryStore.clearUI();
        });
      });
    }

    toggleInfo() {
      this.setState("infoVisible", !this.state.infoVisible);
      console.log(this.infoVisible);
    }

    template() {
      const id = galleryStore.selected[0];
      const validUrl = galleryStore.tempUrls.get(id) || "";
      const imgName = galleryStore.findItemById(id).name;

      // GalleryItem과 완벽하게 일치해야 하는 이름
      const transitionStyle = `view-transition-name: memory-${id};`;

      return html`
        <figure class="${this.styles.overlay}" @click="${this.toggleInfo}">
          ${this.state.infoVisible
            ? html`
                <div class="${this.styles.info}">
                  <figcation class="${this.styles.title}">${imgName}</figcation>
                  <button
                    @click="${this.closeOverlay}"
                    class="${this.styles.close}"
                    type="button"
                  >
                    <ky-icon name="exit"></ky-icon>
                  </button>
                </div>
              `
            : ""}
          <img
            src="${validUrl}"
            style="${transitionStyle}"
            class="${this.styles.image}"
          />
        </figure>
      `;
    }
  },
);
