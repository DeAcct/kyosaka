import { Component, define, html } from "@/lib/core";
import { galleryStore } from "@/store/galleryStore";

import mapping from "./passwordModal.module.scss";
import raw from "./passwordModal.module.scss?inline";

import "@/components/ModalSheet/ModalSheet";
import "@/components/Input/Input";

export const PasswordModal = define("password-modal", { mapping, raw })(
  class extends Component {
    setup() {
      this.state = {
        mode: "unlock", // "unlock" | "set" | "manage"
        password: "",
        confirmPassword: "",
        error: "",
      };
    }

    open(mode = "unlock") {
      this.setState("mode", mode);
      this.setState("password", "");
      this.setState("confirmPassword", "");
      this.setState("error", "");
      this.$refs.sheet.open();
    }

    close() {
      this.setState("password", "");
      this.setState("confirmPassword", "");
      this.setState("error", "");
      this.$refs.sheet.close();
    }

    handleUnlock() {
      const { password } = this.state;
      if (!password) {
        this.setState("error", "비밀번호를 입력해 주세요.");
        return;
      }

      const success = galleryStore.verifyPassword(password);
      if (success) {
        this.close();
      } else {
        this.setState("error", "비밀번호가 올바르지 않습니다.");
      }
    }

    async handleSetPassword() {
      const { password, confirmPassword } = this.state;
      if (!password) {
        this.setState("error", "비밀번호를 입력해 주세요.");
        return;
      }
      if (password !== confirmPassword) {
        this.setState("error", "비밀번호가 일치하지 않습니다.");
        return;
      }

      await galleryStore.setPassword(password);
      this.close();
    }

    handleLockNow() {
      galleryStore.lock();
      this.close();
    }

    async handleClearPassword() {
      await galleryStore.clearPassword();
      this.close();
    }

    template() {
      const { mode, password, confirmPassword, error } = this.state;

      return html`
        <modal-sheet
          $sheet
          @close="${() => this.setState("error", "")}"
        >
          <div class="${this.styles.container}">
            ${mode === "unlock"
              ? html`
                  <h3 class="${this.styles.title}">갤러리 잠금 해제</h3>
                  <p class="${this.styles.sub}">
                    갤러리를 보려면 비밀번호를 입력하세요.
                  </p>
                  <form
                    @submit.prevent="${() => this.handleUnlock()}"
                    class="${this.styles.inputGroup}"
                  >
                    <ky-input
                      type="password"
                      placeholder="비밀번호"
                      value="${password}"
                      @change="${(e) =>
                        this.setState("password", e.detail.value)}"
                    ></ky-input>
                    ${error
                      ? html`<span class="${this.styles.errorText}"
                          >${error}</span
                        >`
                      : ""}
                    <div class="${this.styles.actions}">
                      <button
                        type="submit"
                        class="${this.styles.button} ${this.styles.primary}"
                      >
                        확인
                      </button>
                    </div>
                  </form>
                `
              : mode === "set"
                ? html`
                    <h3 class="${this.styles.title}">새 비밀번호 설정</h3>
                    <p class="${this.styles.sub}">
                      갤러리 보호를 위한 비밀번호를 입력하세요.
                    </p>
                    <form
                      @submit.prevent="${() => this.handleSetPassword()}"
                      class="${this.styles.inputGroup}"
                    >
                      <ky-input
                        type="password"
                        placeholder="비밀번호"
                        value="${password}"
                        @change="${(e) =>
                          this.setState("password", e.detail.value)}"
                      ></ky-input>
                      <ky-input
                        type="password"
                        placeholder="비밀번호 확인"
                        value="${confirmPassword}"
                        @change="${(e) =>
                          this.setState("confirmPassword", e.detail.value)}"
                      ></ky-input>
                      ${error
                        ? html`<span class="${this.styles.errorText}"
                            >${error}</span
                          >`
                        : ""}
                      <div class="${this.styles.actions}">
                        <button
                          type="button"
                          class="${this.styles.button}"
                          @click="${() => this.close()}"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          class="${this.styles.button} ${this.styles.primary}"
                        >
                          저장
                        </button>
                      </div>
                    </form>
                  `
                : html`
                    <h3 class="${this.styles.title}">보안 설정</h3>
                    <p class="${this.styles.description}">
                      갤러리 잠금 옵션을 선택하세요.
                    </p>
                    <div class="${this.styles.inputGroup}">
                      <button
                        type="button"
                        class="${this.styles.button}"
                        @click="${() => this.handleLockNow()}"
                      >
                        지금 잠그기
                      </button>
                      <button
                        type="button"
                        class="${this.styles.button}"
                        @click="${() => this.open("set")}"
                      >
                        비밀번호 변경
                      </button>
                      <button
                        type="button"
                        class="${this.styles.button} ${this.styles.danger}"
                        @click="${() => this.handleClearPassword()}"
                      >
                        비밀번호 해제
                      </button>
                      <button
                        type="button"
                        class="${this.styles.button}"
                        @click="${() => this.close()}"
                      >
                        닫기
                      </button>
                    </div>
                  `}
          </div>
        </modal-sheet>
      `;
    }
  },
);
