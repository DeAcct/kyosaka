import { Component, define, html } from "@/lib/core";

import mapping from "./gallery.layout.module.scss";
import raw from "./gallery.layout.module.scss?inline";

import { TabSelector } from "@/components/TabSelector/TabSelector";

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
    template() {
      return html`
        <div class="${this.styles.gallery}">
          <tab-selector :tabs="${TABS}"></tab-selector>
          <slot></slot>
        </div>
      `;
    }
  },
);
