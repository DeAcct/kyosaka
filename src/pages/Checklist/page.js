import { Component, define, html } from "@/lib/core";
import { checklistStore } from "@/store/checklistStore";
import { useEdit } from "@/hooks/edit";
import { useScroll } from "@/hooks/scroll";

import mapping from "./checklist.page.module.scss";
import raw from "./checklist.page.module.scss?inline";

import { DaySelector } from "@/components/DaySelector/DaySelector";
import { Schedule } from "@/components/Schedule/Schedule";
import { Progress } from "@/components/Progress/Progress";
import { ChecklistItem } from "@/components/ChecklistItem/ChecklistItem";
import { ControlBar } from "@/components/ControlBar/ControlBar";
import "@/components/Input/Input";

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
      const {
        percentage: percent,
        progress,
        items,
        allChecked,
      } = checklistStore;
      return html`
        <global @scroll="${this.handleScroll}"></global>
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
          $controlBar
          class="${this.styles.control} ${this.state.isScrolled ? this.styles.scrolled : ""}"
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
