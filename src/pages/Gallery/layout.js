import { Component, define, html } from "@/lib/core";
import { router } from "@/lib/router";
import { switcher } from "@/lib/switcher";
import { galleryStore } from "@/store/galleryStore";

import mapping from "./gallery.layout.module.scss";
import raw from "./gallery.layout.module.scss?inline";

import { ControlBar } from "@/components/ControlBar/ControlBar";
import { Icon } from "@/components/Icon/Icon";
import { MemoryOverlay } from "@/components/MemoryOverlay/MemoryOverlay";
import { SwipeWrap } from "@/components/SwipeWrap/SwipeWrap";
import { TabSelector } from "@/components/TabSelector/TabSelector";
import { UploadSheet } from "@/components/UploadSheet/UploadSheet";

const TABS = [
  {
    name: "추억",
    to: "/gallery/memory",
  },
  {
    name: "개인정보",
    to: "/gallery/private",
  },
];
export const GalleryLayout = define("layout-gallery", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(galleryStore);
    }

    gallerySwipe({ detail }) {
      const { pathname } = location;
      const nowIndex = TABS.findIndex(({ to }) => to === pathname);
      const step = detail.direction === "right" ? 1 : -1;
      const nextIndex = (nowIndex + TABS.length + step) % 2;
      router.navigate(TABS[nextIndex].to);
    }

    get nowPage() {
      const { pathname } = location;
      const [, , leafNode] = pathname.split("/");
      return leafNode;
    }

    template() {
      return html`
        <div class="${this.styles.gallery}">
          <nav class="${this.styles.tabBar}">
            <tab-selector :tabs="${TABS}"></tab-selector>
          </nav>
          <swipe-wrap
            @swipe="${(e) => {
              this.gallerySwipe(e);
            }}"
          >
            <div class="${this.styles.swipeHitArea}">
              <slot></slot>
            </div>
          </swipe-wrap>

          <control-bar
            class="${this.styles.controller}"
            @delete=${() => {
              galleryStore.deleteSelectedItems();
            }}
            :mode="${galleryStore.mode}"
          >
            <span slot="counter">${galleryStore.selected.length}개 선택됨</span>
            <button
              class="${this.styles.upload} ${galleryStore.mode === "edit"
                ? this.styles.cancel
                : ""}"
              type="button"
              @click="${() => {
                if (galleryStore.mode === "view") {
                  this.$refs.uploadSheet.open();
                } else {
                  galleryStore.toggleEditMode();
                }
              }}"
            >
              <ky-icon
                :name="${galleryStore.mode === "edit" ? "add" : "export"}"
                class="${this.styles.icon}"
              ></ky-icon>
              <span
                class="${this.styles.text} ${galleryStore.mode !== "edit"
                  ? this.styles.show
                  : ""}"
                >새 사진</span
              >
            </button>
          </control-bar>
          <upload-sheet
            $upload-sheet
            :selected="${this.nowPage}"
          ></upload-sheet>

          ${galleryStore.mode === "overlay"
            ? html` <memory-overlay></memory-overlay> `
            : ""}
        </div>
      `;
    }
  },
);
