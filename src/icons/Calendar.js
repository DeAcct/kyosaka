import { Stateless, defineStateless } from "@/lib/core";

export const Calendar = defineStateless("icon-calendar")(
  class extends Stateless {
    template() {
      return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19,5h-2v-1c0-.55-.45-1-1-1s-1,.45-1,1v1h-6v-1c0-.55-.45-1-1-1s-1,.45-1,1v1h-2c-1.1,0-2,.9-2,2v12c0,1.1.9,2,2,2h14c1.1,0,2-.9,2-2V7c0-1.1-.9-2-2-2ZM19,19H5V7h14v12Z" />
        <circle cx="8" cy="13" r="1" />
        <circle cx="12" cy="13" r="1" />
        <circle cx="16" cy="13" r="1" />
      </svg>`;
    }
  }
);
