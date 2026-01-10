import { Stateless, defineStateless } from "@/lib/v2/core";

export const Selected = defineStateless("icon-selected")(
  class extends Stateless {
    template() {
      return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M19,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V5A2,2,0,0,0,19,3ZM5,19V5H19V7.59l-7,7-3.29-3.3a1,1,0,1,0-1.42,1.42l4,4a1,1,0,0,0,1.42,0L19,10.41V19Z"
        />
      </svg>`;
    }
  }
);
