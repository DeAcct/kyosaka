import { html } from "@/lib/core";
import { SchedulePage } from "@/pages/Schedule/Schedule";
import { ChecklistPage } from "./pages/Checklist/Checklist";

export const routes = {
  "/": () => html`<page-schedule></page-schedule>`,
  "/checklist": () => html`<page-checklist></page-checklist>`,
  "/gallery": () => html`<page-gallery></page-gallery>`,
};
