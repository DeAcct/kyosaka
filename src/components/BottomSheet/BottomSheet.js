// components/BottomSheet/BottomSheet.js
import { Component, define, html } from "@/lib/core";
import mapping from "./bottomSheet.module.scss";
import raw from "./bottomSheet.module.scss?inline";

export const BottomSheet = define("bottom-sheet", { mapping, raw })(
  class extends Component {
    setup() {
      this.startY = 0;
      this.currentY = 0;
      this.isDragging = false;
      this.scrollEl = null; // 🎯 터치가 시작된 내부의 스크롤 엘리먼트를 실시간 추적합니다.
    }

    open() {
      this.$refs.dialog.showModal();
      // this.$refs.content.style.translate = `-50% 0`;
      this.$refs.content.style.setProperty("--translate-y", "0px");
      this.$refs.content.style.opacity = 1;
      document.documentElement.classList.toggle("is-locked");
    }

    close() {
      // this.$refs.content.style.translate = `-50% 100%`;
      this.$refs.content.style.opacity = 0;
      this.$refs.content.style.setProperty("--translate-y", "100%");
      this.emit("close");
      this.$refs.dialog.close();
      document.documentElement.classList.toggle("is-locked");
    }

    // 🔍 딤 영역 클릭 시 닫기
    handleBackdropClick(e) {
      if (e.target === this.$refs.dialog) this.close();
    }

    // 🔍 스와이프 로직
    handleTouchStart(e) {
      this.startY = e.touches[0].clientY; //
      this.currentY = 0;
      this.isDragging = true; //
      this.$refs.content.style.transition = "none"; //

      this.scrollEl = null;

      // 🎯 모든 Shadow DOM의 격벽을 우회해 최상위 window까지 정렬된 터치 경로를 확보합니다.
      const path = e.composedPath();

      for (const cur of path) {
        // bottom-sheet 본체 호스트(this)나 content 껍데기를 만나면 탐색을 멈춰 에러를 방지합니다.
        if (cur === this || cur === this.$refs.content) {
          break;
        }

        // 🎯 오직 일반 Element 노드(nodeType === 1)일 때만 스타일을 안전하게 가로챕니다.
        if (cur && cur.nodeType === 1) {
          const style = window.getComputedStyle(cur);
          if (
            (style.overflowY === "auto" || style.overflowY === "scroll") &&
            cur.scrollHeight > cur.clientHeight
          ) {
            this.scrollEl = cur;
            break;
          }
        }
      }
    }

    handleTouchMove(e) {
      if (!this.isDragging) return;
      const currentY = e.touches[0].clientY;
      const delta = currentY - this.startY;

      // 🎯 [충돌 해소 핵심 2] 스크롤 컨테이너 인지 시 시트 오프 모션 정밀 격리 가드
      if (this.scrollEl) {
        // 1. 내부가 이미 밑으로 스크롤되어 있다면 (scrollTop > 0), 내용물 위로 올리기 스크롤을 위해 시트 드래그 모션을 영구 차단합니다.
        if (this.scrollEl.scrollTop > 0) {
          return;
        }
        // 2. 내부가 맨 위(scrollTop === 0)에 닿아있더라도, 위로 끌어올려 내용물 밑을 보려는 제스처(delta < 0)라면 시트 드래그를 차단합니다.
        if (delta < 0) {
          return;
        }
      }

      if (delta > 0) {
        // 3. 실제 시트가 하단으로 끌려가며 닫히는 순간에만 모바일 브라우저 특유의 바운스 및 기본 스크롤 동작을 차단합니다.
        if (e.cancelable) e.preventDefault();
        this.currentY = delta;
        // this.$refs.content.style.translate = `-50% ${delta}px`;
        this.$refs.content.style.setProperty("--translate-y", `${delta}px`);
      }
    }

    handleTouchEnd() {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.$refs.content.style.transition = "all 300ms var(--ease-out-expo)";

      if (this.currentY > 150) {
        // 150px 이상 내려가면 닫기
        this.close();
      } else {
        // this.$refs.content.style.translate = `-50% 0`;
        this.$refs.content.style.setProperty("--translate-y", `0px`);
        this.$refs.content.style.opacity = 1;
      }
      this.currentY = 0;
      this.scrollEl = null; // 제스처 종료 시 초기화
    }

    template() {
      return html`
        <dialog
          $dialog
          class="${this.styles.dialog}"
          @click="${this.handleBackdropClick}"
        >
          <div
            part="content"
            $content
            class="${this.styles.content}"
            @touchstart="${this.handleTouchStart}"
            @touchmove="${this.handleTouchMove}"
            @touchend="${this.handleTouchEnd}"
          >
            <div class="${this.styles.handleBar}"></div>
            <slot></slot>
          </div>
        </dialog>
      `;
    }
  },
);
