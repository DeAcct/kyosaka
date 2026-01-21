import { Component, define, html } from "@/lib/core";

import mapping from "./private.page.module.scss";
import raw from "./private.page.module.scss?inline";

export const PrivatePage = define("page-private", { mapping, raw })(
  class extends Component {
    template() {
      return html`부리부리~!부리부리~!`;
    }
  },
);
