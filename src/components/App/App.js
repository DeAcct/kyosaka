import { Component, define, html } from "@/lib/core";
import { Router } from "@/lib/router";

import mapping from "./app.module.scss";
import raw from "./app.module.scss?inline";

import { Header } from "@/components/Header/Header";
import { NavigationBar } from "@/components/NavigationBar/NavigationBar";

export const App = define("ky-app", { mapping, raw })(
  class extends Component {
    afterRender() {
      if (this.router) return;
      const $container = this.$selector("[data-router-view]");
      Router.redirects = {
        "/gallery": "/gallery/memory",
      };
      this.router = new Router($container);
    }

    template() {
      return html`
        <ky-header></ky-header>
        <main data-router-view></main>
        <navigation-bar class="${this.styles.navigationBar}"></navigation-bar>
      `;
    }
  },
);
