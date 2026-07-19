import { Component, define, html, flushSync, block } from "@/lib/core";
import { useGalleryData } from "@/hooks/gallery";
import { useOverlayTransition, stackIn } from "@/hooks/overlayMotion";

import { galleryStore } from "@/store/galleryStore";

import mapping from "./private.page.module.scss";
import raw from "./private.page.module.scss?inline";

import { GalleryItem } from "@/components/GalleryItem/GalleryItem";
import { Icon } from "@/components/Icon/Icon";

const galleryItemBlock = block((props) => html`
  <gallery-item
    data-key="item-${props.item.id}"
    class="${props.itemClass} ${props.isSelected ? props.selectedClass : ""}"
    :item="${props.item}"
    @longpress="${props.onLongPress}"
    @click="${props.onClick}"
    style="--i:${props.index}"
  >
    <strong class="${props.fileNameClass}"> ${props.item.name} </strong>
  </gallery-item>
`);

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
            return galleryItemBlock({
              item,
              index,
              isSelected,
              itemClass: this.styles.item,
              selectedClass: this.styles.selected,
              fileNameClass: this.styles.fileName,
              onLongPress: (e) => {
                if (mode === "edit") {
                  return;
                }
                galleryStore.toggleEditMode();
                galleryStore.toggleItemSelection(item.id);
              },
              onClick: () => {
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
