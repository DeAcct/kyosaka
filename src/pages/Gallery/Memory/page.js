import { Component, define, html } from "@/lib/core";
import { useGalleryData } from "@/hooks/gallery";
import { galleryStore } from "@/store/galleryStore";

import mapping from "./memory.page.module.scss";
import raw from "./memory.page.module.scss?inline";

import { MemoryItem } from "@/components/MemoryItem/MemoryItem";

export const MemoryPage = define("page-memory", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(galleryStore);
      // this.longPressHandlers = useLongPress(() => {
      //   this.emit("longpress", {
      //     detail: { id: this.item.id },
      //     bubbles: true,
      //     composed: true,
      //   });
      // });
    }
    async afterOnce() {
      const { sync } = useGalleryData("memory");
      await sync();
    }

    onLongpressItem({ detail }) {
      console.log(detail);
    }

    template() {
      const { items } = useGalleryData("memory");
      return html`
        <ul class="${this.styles.grid}">
          ${items.map((item, index) => {
            return html`
              <memory-item
                :item="${item}"
                @longpress="${(e) => {
                  this.onLongpressItem(e);
                }}"
                style="--i:${index}"
              >
              </memory-item>
            `;
          })}
        </ul>
      `;
    }
  },
);
