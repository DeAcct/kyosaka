// GalleryItem.js
import { Component, define, html } from "@/lib/core";
import { useGalleryData } from "@/hooks/gallery";
import { useLongPress } from "@/hooks/touch";
import { galleryStore } from "@/store/galleryStore";

import mapping from "./galleryItem.module.scss";
import raw from "./galleryItem.module.scss?inline";

export const GalleryItem = define("gallery-item", { mapping, raw })(
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
      const { pointerdown, pointermove, pointerup, pointerleave } =
        this.longPressHandlers;

      const { id, name } = this.item;
      const validUrl = galleryStore.tempUrls.get(id) || "";

      // View Transition 고유 식별자
      const transitionStyle = `view-transition-name: memory-${id};`;

      return html`
        <host
          @pointerdown="${pointerdown}"
          @pointerup="${pointerup}"
          @pointermove="${pointermove}"
          @pointerleave="${pointerleave}"
          @contextmenu.prevent="${() => {}}"
        ></host>
        <img
          part="image"
          :src="${validUrl}"
          alt="${name}"
          style="${transitionStyle}"
          class="${this.styles.img} ${validUrl ? this.styles.loaded : ""}"
        />
        <slot></slot>
      `;
    }
  },
);
