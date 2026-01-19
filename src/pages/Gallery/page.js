import { Component, define, html } from "@/lib/core";

import mapping from "./gallery.page.module.scss";
import raw from "./gallery.page.module.scss?inline";

export const GalleryPage = define("page-gallery", { mapping, raw })(
  class extends Component {
    template() {
      return html``;
    }
  },
);
