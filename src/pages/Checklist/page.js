import { Component, define, html, block } from "@/lib/core";
import { checklistStore } from "@/store/checklistStore";
import { scheduleStore } from "@/store/scheduleStore";
import { useScroll } from "@/hooks/scroll";

import mapping from "./checklist.page.module.scss";
import raw from "./checklist.page.module.scss?inline";

import "@/components/Input/Input";
import "@/components/ControlBar/ControlBar";
import "@/components/ChecklistItem/ChecklistItem";
import "@/components/DaySelector/DaySelector";
import "@/components/TabSelector/TabSelector";
import "@/components/ContextMenu/ContextMenu";
import "@/components/ChecklistMoveSheet/ChecklistMoveSheet";
import "@/components/ChecklistDeleteSheet/ChecklistDeleteSheet";

const checklistItemBlock = block(
  (props) => html`
    <checklist-item
      class="${props.itemClass}"
      :item="${props.item}"
      @toggle="${props.onToggle}"
      @longpress="${props.onLongpress}"
    ></checklist-item>
  `,
);

export const ChecklistPage = define("page-checklist", { mapping, raw })(
  class extends Component {
    setup() {
      this.state = {
        isScrolled: false,
        tab: "day",
        activeItemId: null,
      };

      this.subscribe(checklistStore);
      this.subscribe(scheduleStore);
      this.handleScroll = useScroll(this, "isScrolled");
    }

    onToggleItem({ detail }) {
      checklistStore.toggleItem(detail.id);
    }

    handleNew(e) {
      const text = e.detail?.value?.trim();

      if (text) {
        const day =
          this.state.tab === "day"
            ? (scheduleStore.selectedPlan?.selected ?? 0)
            : null;
        checklistStore.addItem(text, day);
        if (this.$refs.controlBar) {
          this.$refs.controlBar.clear();
          this.$refs.controlBar.focus();
        }
      }
    }

    openContextMenu(e) {
      const id = e.detail.id;
      this.setState("activeItemId", id);

      const item = checklistStore.items.find((i) => i.id === id);

      this.$refs.contextMenu.open({
        title: item?.text || "",
        options: [
          {
            text: "이동",
            icon: "move_up",
            action: () => this.$refs.moveSheet.open({ currentDay: item?.day ?? null }),
          },
          {
            text: "삭제",
            icon: "delete",
            danger: true,
            action: () => this.$refs.deleteSheet.open(),
          },
        ],
      });
    }

    moveItem(dayIndex) {
      const { activeItemId } = this.state;
      if (!activeItemId) return;

      checklistStore.moveItemsToDay([activeItemId], dayIndex);
      this.setState("activeItemId", null);
    }

    deleteItem() {
      const { activeItemId } = this.state;
      if (!activeItemId) return;

      checklistStore.removeList([activeItemId]);
      this.setState("activeItemId", null);
    }

    template() {
      const { items } = checklistStore;
      const selectedDayIndex = scheduleStore.selectedPlan?.selected ?? 0;

      const filteredItems = items.filter((item) =>
        this.state.tab === "day"
          ? item.day === selectedDayIndex
          : item.day === null,
      );

      return html`
        <global @scroll="${this.handleScroll}"></global>

        <div class="${this.styles.container}">
          <nav class="${this.styles.tabBar}">
            <tab-selector
              :tabs="${[
                { name: "일차별", value: "day" },
                { name: "공통", value: "common" },
              ]}"
              value="${this.state.tab}"
              @change="${(e) => this.setState("tab", e.detail)}"
            ></tab-selector>
          </nav>
          <div class="${this.styles.content}">
            <day-selector
              class="${this.styles.sidebar} ${this.state.tab !== "day"
                ? this.styles.hide
                : ""}"
            ></day-selector>
            <section class="${this.styles.list}">
              ${filteredItems.map((item, index) =>
                checklistItemBlock({
                  item,
                  index,
                  itemClass: this.styles.item,
                  onToggle: (e) => this.onToggleItem(e),
                  onLongpress: (e) => this.openContextMenu(e),
                }),
              )}
            </section>
          </div>
        </div>

        <control-bar
          $control-bar
          class="${this.styles.control} ${this.state.isScrolled
            ? this.styles.scrolled
            : ""}"
          @submit="${(e) => this.handleNew(e)}"
          mode="view"
          placeholder="체크리스트 추가"
          primary-icon="add"
        >
        </control-bar>

        <context-menu $context-menu></context-menu>

        <checklist-move-sheet
          $move-sheet
          @confirm="${(e) => this.moveItem(e.detail)}"
        ></checklist-move-sheet>

        <checklist-delete-sheet
          $delete-sheet
          @confirm="${() => this.deleteItem()}"
        ></checklist-delete-sheet>
      `;
    }
  },
);
