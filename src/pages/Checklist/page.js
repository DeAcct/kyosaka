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
      class="${props.itemClass} ${props.isSelected ? props.selectedClass : ""}"
      :item="${props.item}"
      :selectmode="${props.isSelectMode}"
      @toggle="${props.onToggle}"
      @item-click="${props.onItemClick}"
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
      };

      this.subscribe(checklistStore);
      this.subscribe(scheduleStore);
      this.handleScroll = useScroll(this, "isScrolled");
    }

    handleGlobalClick(e) {
      if (!checklistStore.isSelectMode) return;

      const path = e.composedPath();
      const isInsideInteractive = path.some((target) => {
        if (!target || !target.tagName) return false;
        const tag = target.tagName.toLowerCase();
        return (
          tag === "checklist-item" ||
          tag === "context-menu" ||
          tag === "checklist-move-sheet" ||
          tag === "checklist-delete-sheet" ||
          tag === "modal-sheet"
        );
      });

      if (!isInsideInteractive) {
        checklistStore.clearSelection();
        this.$refs.contextMenu?.close();
      }
    }

    updateContextMenuTitle() {
      if (!checklistStore.isSelectMode || !this.$refs.contextMenu) {
        this.$refs.contextMenu?.close();
        return;
      }

      const { selectedIds, items } = checklistStore;
      const count = selectedIds.length;
      if (count === 0) {
        this.$refs.contextMenu?.close();
        return;
      }

      const firstItem = items.find((i) => i.id === selectedIds[0]);
      const firstText = firstItem?.text || "";

      let title = "";
      if (count === 1) {
        title = `${firstText} 선택됨`;
      } else if (count > 1) {
        title = `${firstText} 외 ${count - 1}개 선택됨`;
      }

      const options = [
        {
          text: "이동",
          icon: "move_up",
          action: () => {
            this.$refs.moveSheet.open({
              currentDay: firstItem?.day ?? null,
            });
          },
        },
        {
          text: "삭제",
          icon: "delete",
          danger: true,
          action: () => {
            this.$refs.deleteSheet.open({
              count: checklistStore.selectedIds.length,
            });
          },
        },
      ];

      this.$refs.contextMenu.open({
        title,
        options,
        passthrough: true,
      });
    }

    onToggleItem({ detail }) {
      const { id } = detail;
      if (checklistStore.isSelectMode) {
        checklistStore.toggleSelectItem(id);
        if (!checklistStore.isSelectMode) {
          this.$refs.contextMenu?.close();
        } else {
          this.updateContextMenuTitle();
        }
      } else {
        checklistStore.toggleItem(id);
      }
    }

    onItemClick({ detail }) {
      const { id } = detail;
      if (checklistStore.isSelectMode) {
        checklistStore.toggleSelectItem(id);
        if (!checklistStore.isSelectMode) {
          this.$refs.contextMenu?.close();
        } else {
          this.updateContextMenuTitle();
        }
      }
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
      checklistStore.selectItem(id);
      this.updateContextMenuTitle();
    }

    moveItem(dayIndex) {
      checklistStore.moveSelectedToDay(dayIndex);
    }

    deleteItem() {
      checklistStore.removeSelected();
    }

    template() {
      const { items, selectedIds, isSelectMode } = checklistStore;
      const selectedDayIndex = scheduleStore.selectedPlan?.selected ?? 0;

      const filteredItems = items.filter((item) =>
        this.state.tab === "day"
          ? item.day === selectedDayIndex
          : item.day === null,
      );

      return html`
        <global
          @scroll="${this.handleScroll}"
          @click="${(e) => this.handleGlobalClick(e)}"
        ></global>

        <div class="${this.styles.container}">
          <nav class="${this.styles.tabBar}">
            <tab-selector
              :tabs="${[
                { name: "일차별", value: "day" },
                { name: "공통", value: "common" },
              ]}"
              value="${this.state.tab}"
              @change="${(e) => {
                this.setState("tab", e.detail);
                checklistStore.clearSelection();
              }}"
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
                  isSelected: selectedIds.includes(item.id),
                  selectedClass: isSelectMode && selectedIds.includes(item.id) ? this.styles.selected : "",
                  isSelectMode: isSelectMode,
                  onToggle: (e) => this.onToggleItem(e),
                  onItemClick: (e) => this.onItemClick(e),
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
          mode="view"
          placeholder="체크리스트 추가"
          primary-icon="add"
          @submit="${(e) => this.handleNew(e)}"
        >
        </control-bar>

        <context-menu
          $context-menu
          @close="${() => checklistStore.clearSelection()}"
        ></context-menu>

        <checklist-move-sheet
          $move-sheet
          @close="${() => checklistStore.clearSelection()}"
          @confirm="${(e) => this.moveItem(e.detail?.dayIndex ?? e.detail)}"
        ></checklist-move-sheet>

        <checklist-delete-sheet
          $delete-sheet
          @close="${() => checklistStore.clearSelection()}"
          @confirm="${() => this.deleteItem()}"
        ></checklist-delete-sheet>
      `;
    }
  },
);
