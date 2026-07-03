import { Component, define, html, flushSync } from "@/lib/core";
import { useGalleryData } from "@/hooks/gallery";
import { useOverlayTransition, stackIn } from "@/hooks/overlayMotion";

import { galleryStore } from "@/store/galleryStore";

import mapping from "./memory.page.module.scss";
import raw from "./memory.page.module.scss?inline";

import { GalleryItem } from "@/components/GalleryItem/GalleryItem";
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
      const { mode, selected } = galleryStore;

      console.log(mode, selected);

      return html`
        <section class="${this.styles.grid}">
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
                  console.log("longpress", mode);
                  if (mode === "edit") {
                    return;
                  }
                  galleryStore.toggleEditMode();
                  galleryStore.toggleItemSelection(item.id);
                }}"
                @click="${() => {
                  console.log("click", mode);
                  if (mode === "edit") {
                    galleryStore.toggleItemSelection(item.id);
                  } else {
                    useOverlayTransition(stackIn, () => {
                      flushSync(() => {
                        galleryStore.openOverlay(item.id);
                      });
                    });
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
              </gallery-item>
            `;
          })}
        </section>
      `;
    }
  },
);
