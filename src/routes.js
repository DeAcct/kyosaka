import { html } from "@/lib/core";
import { SchedulePage } from "@/pages/Schedule/Schedule";
import { ChecklistPage } from "./pages/Checklist/Checklist";

export const routes = [
  {
    path: "/",
    component: () => html`<page-schedule></page-schedule>`,
  },
  {
    path: "/checklist",
    component: () => html`<page-checklist></page-checklist>`,
  },
  {
    path: "/gallery",
    component: () => html`<page-gallery></page-gallery>`,
  },
];
