import { Component, define, html } from "@/lib/core";
import { checklistStore } from "@/store/checklistStore";
import { useEdit } from "@/hooks/edit";

import mapping from "./checklist.page.module.scss";
import raw from "./checklist.page.module.scss?inline";

import { DaySelector } from "@/components/DaySelector/DaySelector";
import { Schedule } from "@/components/Schedule/Schedule";
import { Progress } from "@/components/Progress/Progress";
import { ChecklistItem } from "@/components/ChecklistItem/ChecklistItem";
import { ControlBar } from "@/components/ControlBar/ControlBar";

export const ChecklistPage = define("page-checklist", { mapping, raw })(
  class extends Component {
    setup() {
      this.editor = useEdit(this);
      this.state = {
        ...this.editor.state, // 훅의 초기 상태 병합
      };

      this.subscribe(checklistStore);
    }

    onToggleItem({ detail }) {
      if (this.state.mode === "edit") return;
      checklistStore.toggleItem(detail.id);
    }

    handleNew() {
      if (this.state.mode === "edit") {
        // x를 눌러 선택취소한 경우
        this.editor.exitEdit();
        return;
      }
      const $input = this.$refs.input;
      const text = $input.value.trim();

      if (text) {
        checklistStore.addItem(text);
        $input.value = "";
        $input.focus();
      }
    }

    template() {
      const {
        percentage: percent,
        progress,
        items,
        allChecked,
      } = checklistStore;
      return html`
        <div class="${this.styles.doubleCol}">
          <ky-progress
            :progress="${progress}"
            class="${this.styles.sticky}"
            style="--list-length: ${items.length + 2}"
          >
            <span class="${this.styles.title}">체크리스트 완료 현황</span>
            <strong class="${this.styles.progress}">
              ${allChecked.length} / ${items.length}
            </strong>
          </ky-progress>
          <h2 class="${this.styles.title}">전체 체크리스트</h2>
          <section class="${this.styles.list}">
            ${items.map(
              (item, index) => html`
                <checklist-item
                  data-key="item-${item.id}"
                  class="${this.styles
                    .item} ${this.state.deleteSelected.includes(item.id)
                    ? this.styles.selected
                    : ""}"
                  style="--i:${index}"
                  :item="${item}"
                  @toggle="${(e) => {
                    this.onToggleItem(e);
                  }}"
                  @longpress="${(e) => {
                    this.editor.onLongpressItem(e);
                  }}"
                  @click="${() => {
                    this.editor.onClickItem(item.id);
                  }}"
                  :selectmode="${this.state.mode === "edit"}"
                ></checklist-item>
              `,
            )}
          </section>
        </div>
        <control-bar
          class="${this.styles.control}"
          @delete=${() => {
            checklistStore.removeList(this.state.deleteSelected);
            this.setState("mode", "view");
          }}
          :mode="${this.state.mode}"
        >
          <span slot="counter"
            >${this.state.deleteSelected.length}개 선택됨</span
          >
          <input
            name="newItem"
            type="text"
            $input
            placeholder="체크리스트 추가"
            class="${this.styles.input} ${this.state.mode === "view"
              ? this.styles.show
              : ""}"
          />
          <button
            type="button"
            class="${this.styles.button} ${this.state.mode === "edit"
              ? this.styles.cancel
              : ""}"
            @click="${(e) => {
              this.handleNew(e);
            }}"
          >
            <ky-icon class="${this.styles.icon}" name="add"></ky-icon>
          </button>
        </control-bar>
      `;
    }
  },
);
