import { Component, define, html, flushSync } from "@/lib/core";
import { useGalleryData } from "@/hooks/gallery";
import { useOverlayTransition } from "@/hooks/overlayMotion";

import { galleryStore } from "@/store/galleryStore";

import mapping from "./private.page.module.scss";
import raw from "./private.page.module.scss?inline";

import { GalleryItem } from "@/components/GalleryItem/GalleryItem";
import { Icon } from "@/components/Icon/Icon";
export const PrivatePage = define("page-private", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(galleryStore);
    }
    async afterOnce() {
      const { sync } = useGalleryData("private");
      await sync();
    }
    onDisconnected() {
      galleryStore.clearUI();
    }

    template() {
      const { items } = useGalleryData("private");
      const { mode, selected } = galleryStore.state.ui;

      return html`
        <section class="${this.styles.list}">
          ${items.map((item, index) => {
            const isSelected = mode === "edit" && selected.includes(item.id);
            return html`
              <gallery-item
                data-key="item-${item.id}"
                class="${this.styles.item} ${isSelected
                  ? this.styles.selected
                  : ""}"
                :item="${item}"
                @longpress="${(e) => {
                  if (mode === "edit") {
                    return;
                  }
                  galleryStore.toggleEditMode();
                  galleryStore.toggleItemSelection(item.id);
                }}"
                @click="${() => {
                  // 🎯 편집 모드일 때만 선택 토글, 아니면 일반 클릭(상세보기 등)
                  if (mode === "edit") {
                    galleryStore.toggleItemSelection(item.id);
                  } else {
                    useOverlayTransition(() => {
                      flushSync(() => {
                        galleryStore.openOverlay(item.id);
                      });
                    });
                  }
                }}"
                style="--i:${index}"
              >
                <strong class="${this.styles.fileName}"> ${item.name} </strong>
              </gallery-item>
            `;
          })}
        </section>
      `;
    }
  },
);
