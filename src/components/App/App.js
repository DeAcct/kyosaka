import { Component, define, html } from "@/lib/core";
import { Router } from "@/lib/router";

import mapping from "./app.module.scss";
import raw from "./app.module.scss?inline";

import { Header } from "@/components/Header/Header";
import { NavigationBar } from "@/components/NavigationBar/NavigationBar";
import { PWASheet } from "../PWASheet/PWASheet";
import { ToastConsumer } from "@/components/ToastConsumer/ToastConsumer";

export const App = define("ky-app", { mapping, raw })(
  class extends Component {
    state = {
      scrollAmout: 0
    }


    afterRender() {
      if (this.router) return;
      const $container = this.$selector("[data-router-view]");
      Router.redirects = {
        "/gallery": "/gallery/memory",
      };
      Router.rootPath = "schedule";
      this.router = new Router($container);
    }

    navbarControl(e){
      this.setState("scrollAmount", e)
    }

    template() {
      return html`
        <global @scroll="${(e) =>{ this.navbarControl(e)}}"></global>
        <pwa-sheet></pwa-sheet>
        <ky-header></ky-header>
        <main data-router-view></main>
        <toast-consumer></toast-consumer>
        <navigation-bar class="${this.styles.navigationBar}"></navigation-bar>
      `;
    }
  },
);
