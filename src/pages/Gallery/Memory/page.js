import { Component, define, html } from "@/lib/core";
import { useGalleryData } from "@/hooks/gallery";

import { galleryStore } from "@/store/galleryStore";

import mapping from "./memory.page.module.scss";
import raw from "./memory.page.module.scss?inline";

import { MemoryItem } from "@/components/MemoryItem/MemoryItem";
import { Icon } from "@/components/Icon/Icon";

export const MemoryPage = define("page-memory", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(galleryStore);
    }
    async afterOnce() {
      const { sync } = useGalleryData("memory");
      await sync();
    }
    onDisconnected() {
      galleryStore.clearUI();
    }

    template() {
      const { items } = useGalleryData("memory");
      const { mode, selected } = galleryStore.state.ui;

      return html`
        <section class="${this.styles.grid}">
          ${items.map((item, index) => {
            const isSelected = selected.includes(item.id);
            return html`
              <memory-item
                data-key="item-${item.id}"
                class="${this.styles.item} ${isSelected
                  ? this.styles.selected
                  : ""}"
                :item="${item}"
                @longpress="${(e) => {
                  if (mode === "edit") {
                    return;
                  }
                  galleryStore.toggleUIMode(item.id);
                }}"
                @click="${() => {
                  // 🎯 편집 모드일 때만 선택 토글, 아니면 일반 클릭(상세보기 등)
                  if (mode === "edit") {
                    galleryStore.toggleItemSelection(item.id);
                  } else {
                    console.log("상세보기 이동:", item.id);
                  }
                }}"
                style="--i:${index}"
              >
                <ky-icon
                  name="checked"
                  class="${this.styles.checked} ${isSelected
                    ? this.styles.show
                    : ""}"
                ></ky-icon>
              </memory-item>
            `;
          })}
        </section>
      `;
    }
  },
);
