import { Component, define, html } from "@/lib/core";
import { router } from "@/lib/router";
import { switcher } from "@/lib/switcher";

import mapping from "./gallery.layout.module.scss";
import raw from "./gallery.layout.module.scss?inline";

import { TabSelector } from "@/components/TabSelector/TabSelector";
import { SwipeWrap } from "@/components/SwipeWrap/SwipeWrap";

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
      const nextIndex = switcher(detail)
        .case(
          ({ direction }) => direction === "left",
          () => (nowIndex + 2 - 1) % 2,
        )
        .case(
          ({ direction }) => direction === "right",
          () => (nowIndex + 1) % 2,
        )
        .default(() => {});
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
        </div>
      `;
    }
  },
);
