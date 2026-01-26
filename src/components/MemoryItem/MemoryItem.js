import { Component, define, html } from "@/lib/core";
import { useGalleryData } from "@/hooks/gallery";
import { useLongPress } from "@/hooks/touch";
import { galleryStore } from "@/store/galleryStore";

import mapping from "./memoryItem.module.scss";
import raw from "./memoryItem.module.scss?inline";

export const MemoryItem = define("memory-item", { mapping, raw })(
  class extends Component {
    setup() {
      this.longPressHandlers = useLongPress(() => {
        this.emit("longpress", {
          detail: { id: this.item.id },
          bubbles: true,
          composed: true,
        });
      });
    }

    template() {
      const { pointerdown, pointerup, pointerleave } = this.longPressHandlers;

      const { id, name } = this.item;
      const validUrl = galleryStore.tempUrls.get(id) || "";
      return html`
        <host
          key="${id}"
          @pointerdown="${pointerdown}"
          @pointerup="${pointerup}"
          @pointerleave="${pointerleave}"
          @contextmenu.prevent="${() => {}}"
        ></host>
        <img
          src="${validUrl}"
          alt="${name}"
          class="${this.styles.img} ${validUrl ? this.styles.loaded : ""}"
        />
        <slot></slot>
      `;
    }
  },
);
