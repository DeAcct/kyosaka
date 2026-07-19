import { Component, define, html, block } from "@/lib/core";
import { checklistStore } from "@/store/checklistStore";
import { useEdit } from "@/hooks/edit";
import { useScroll } from "@/hooks/scroll";

import mapping from "./checklist.page.module.scss";
import raw from "./checklist.page.module.scss?inline";

import "@/components/Input/Input";
import "@/components/ControlBar/ControlBar";
import "@/components/ChecklistItem/ChecklistItem";

const checklistItemBlock = block(
  (props) => html`
    <checklist-item
      data-key="item-${props.item.id}"
      class="${props.itemClass} ${props.isSelected ? props.selectedClass : ""}"
      style="--i:${props.index}"
      :item="${props.item}"
      @toggle="${props.onToggle}"
      @longpress="${props.onLongPress}"
      @click="${props.onClick}"
      :selectmode="${props.selectMode}"
    ></checklist-item>
  `,
);

export const ChecklistPage = define("page-checklist", { mapping, raw })(
  class extends Component {
    setup() {
      this.editor = useEdit(this);
      this.state = {
        ...this.editor.state, // 훅의 초기 상태 병합
      };

      this.subscribe(checklistStore);
      this.handleScroll = useScroll(this, "isScrolled");
    }

    onToggleItem({ detail }) {
      if (this.state.mode === "edit") return;
      checklistStore.toggleItem(detail.id);
    }

    handleNew(e) {
      if (this.state.mode === "edit") {
        // x를 눌러 선택취소한 경우
        this.editor.exitEdit();
        return;
      }
      const text = e.detail?.value?.trim();

      if (text) {
        checklistStore.addItem(text);
        if (this.$refs.controlBar) {
          this.$refs.controlBar.clear();
          this.$refs.controlBar.focus();
        }
      }
    }

    template() {
      const { items } = checklistStore;
      return html`
        <global @scroll="${this.handleScroll}"></global>
        <div class="${this.styles.doubleCol}">
          <section class="${this.styles.list}">
            ${items.map((item, index) =>
              checklistItemBlock({
                item,
                index,
                itemClass: this.styles.item,
                isSelected: this.state.deleteSelected.includes(item.id),
                selectedClass: this.styles.selected,
                onToggle: (e) => this.onToggleItem(e),
                onLongPress: (e) => this.editor.onLongpressItem(e),
                onClick: () => this.editor.onClickItem(item.id),
                selectMode: this.state.mode === "edit",
              }),
            )}
          </section>
        </div>
        <control-bar
          $controlBar
          class="${this.styles.control} ${this.state.isScrolled
            ? this.styles.scrolled
            : ""}"
          @delete=${() => {
            checklistStore.removeList(this.state.deleteSelected);
            this.setState("mode", "view");
          }}
          @submit="${(e) => {
            this.handleNew(e);
          }}"
          :mode="${this.state.mode}"
          placeholder="체크리스트 추가"
          primary-icon="add"
        >
          <span slot="counter"
            >${this.state.deleteSelected.length}개 선택됨</span
          >
        </control-bar>
      `;
    }
  },
);
