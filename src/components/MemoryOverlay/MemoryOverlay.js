import { Component, define, html, flushSync } from "@/lib/core";
import { galleryStore } from "@/store/galleryStore";
import { useOverlayTransition } from "@/hooks/overlayMotion";

import mapping from "./memoryOverlay.module.scss";
import raw from "./memoryOverlay.module.scss?inline";

export const MemoryOverlay = define("memory-overlay", { mapping, raw })(
  class extends Component {
    closeOverlay() {
      useOverlayTransition(() => {
        flushSync(() => {
          galleryStore.clearUI();
        });
      });
    }

    template() {
      const id = galleryStore.selected[0];
      const validUrl = galleryStore.tempUrls.get(id) || "";

      // GalleryItem과 완벽하게 일치해야 하는 이름
      const transitionStyle = `view-transition-name: memory-${id};`;

      return html`
        <div class="${this.styles.overlay}" @click="${this.closeOverlay}">
          <img
            src="${validUrl}"
            style="${transitionStyle}"
            class="${this.styles.image}"
          />
        </div>
      `;
    }
  },
);
