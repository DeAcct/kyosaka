import { Component, define, html } from "@/lib/core";
import { router } from "@/lib/router";
import { switcher } from "@/lib/switcher";

import mapping from "./gallery.layout.module.scss";
import raw from "./gallery.layout.module.scss?inline";

import { TabSelector } from "@/components/TabSelector/TabSelector";
import { SwipeWrap } from "@/components/SwipeWrap/SwipeWrap";
import { Icon } from "@/components/Icon/Icon";
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
    gallerySwipe({ detail }) {
      const { pathname } = location;
      const nowIndex = TABS.findIndex(({ to }) => to === pathname);
      const step = detail.direction === "right" ? 1 : -1;
      const nextIndex = (nowIndex + TABS.length + step) % 2;
      router.navigate(TABS[nextIndex].to);
    }

    template() {
      return html`
        <div class="${this.styles.gallery}">
          <nav class="${this.styles.controller}">
            <tab-selector :tabs="${TABS}"></tab-selector>
          </nav>

          <swipe-wrap
            @swipe="${(e) => {
              this.gallerySwipe(e);
            }}"
          >
            <slot></slot>
          </swipe-wrap>

          <button
            class="${this.styles.upload}"
            type="button"
            @click="${() => {
              this.$refs.uploadSheet.open();
            }}"
          >
            <ky-icon name="upload" class="${this.styles.icon}"></ky-icon>
            <span class="${this.styles.text}">새 사진</span>
          </button>

          <upload-sheet $upload-sheet></upload-sheet>
        </div>
      `;
    }
  },
);
