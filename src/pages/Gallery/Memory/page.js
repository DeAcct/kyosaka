import { Component, define, html } from "@/lib/core";

import mapping from "./memory.page.module.scss";
import raw from "./memory.page.module.scss?inline";

export const MemoryPage = define("page-memory", { mapping, raw })(
  class extends Component {
    template() {
      return html`메모리 미모리 공주를 구하러 가자!`;
    }
  },
);
