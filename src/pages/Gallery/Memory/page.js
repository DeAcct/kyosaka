import { Component, define, html, flushSync, block } from "@/lib/core";
import { useGalleryData } from "@/hooks/gallery";
import { useOverlayTransition, stackIn } from "@/hooks/overlayMotion";

import { galleryStore } from "@/store/galleryStore";

import mapping from "./memory.page.module.scss";
import raw from "./memory.page.module.scss?inline";

import { GalleryItem } from "@/components/GalleryItem/GalleryItem";
import { Icon } from "@/components/Icon/Icon";

const memoryItemBlock = block((props) => html`
  <gallery-item
    data-key="item-${props.item.id}"
    class="${props.itemClass} ${props.isSelected ? props.selectedClass : ""}"
    :item="${props.item}"
    @longpress="${props.onLongPress}"
    @click="${props.onClick}"
    style="--i:${props.index}"
  >
    <ky-icon
      name="checked"
      class="${props.checkedClass} ${props.isSelected ? props.showClass : ""}"
    ></ky-icon>
  </gallery-item>
`);

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
            return memoryItemBlock({
              item,
              index,
              isSelected,
              itemClass: this.styles.item,
              selectedClass: this.styles.selected,
              checkedClass: this.styles.checked,
              showClass: this.styles.show,
              onLongPress: (e) => {
                console.log("longpress", mode);
                if (mode === "edit") {
                  return;
                }
                galleryStore.toggleEditMode();
                galleryStore.toggleItemSelection(item.id);
              },
              onClick: () => {
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
              }
            });
          })}
        </section>
      `;
    }
  },
);
