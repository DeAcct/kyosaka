import { html } from "@/lib/v2/core";

export const routes = {
  "/": () => html`<page-schedule></page-schedule>`,
  "/checklist": () => html`<page-checklist></page-checklist>`,
  "/gallery": () => html`<page-gallery></page-gallery>`,
};
