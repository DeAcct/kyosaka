import { Component, define, html } from "@/lib/core";
import { galleryStore } from "@/store/galleryStore";

import mapping from "./uploadSheet.module.scss";
import raw from "./uploadSheet.module.scss?inline";

import { BottomSheet } from "@/components/BottomSheet/BottomSheet";
import { RadioGroup } from "@/components/RadioGroup/RadioGroup";

export const UploadSheet = define("upload-sheet", { mapping, raw })(
  class extends Component {
    setup() {
      this.state = {
        pendingFile: null,
        name: "",
        selectedType: "memory",
      };
    }
    reset() {
      this.setState("pendingFile", null);
      this.setState("name", "");
    }

    open() {
      this.$refs.sheet.open();
    }

    async handleUpload() {
      const { pendingFile, selectedType, name } = this.state;
      if (!pendingFile) return;

      await galleryStore.saveItem(pendingFile, selectedType, name);
      this.reset();
      this.$refs.sheet.close();
    }

    template() {
      const { name, selectedType, pendingFile } = this.state;
      return html`
        <bottom-sheet $sheet @close="${this.reset}">
          <form class="${this.styles.uploadSheet}">
            <h3 class="${this.styles.title}">새 사진 추가</h3>

            <radio-group
              class="${this.styles.types}"
              :options="${[
                { key: "memory", text: "추억" },
                { key: "private", text: "개인정보" },
              ]}"
              :value="${selectedType}"
              @change="${(e) => this.setState("selectedType", e.detail.value)}"
            ></radio-group>

            <div class="${this.styles.picker}">
              <button
                class="${this.styles.button}"
                @click="${() => this.$refs.fileInput.click()}"
                type="button"
              >
                <ky-icon
                  :name="${pendingFile ? "checked" : "gallery"}"
                  class="${this.styles.icon}"
                ></ky-icon>
                ${pendingFile ? "파일 선택됨" : "이미지 선택"}
              </button>
              <input
                type="file"
                $file-input
                hidden
                @change="${(e) => {
                  const file = e.target.files[0];
                  this.setState("pendingFile", file);
                  if (this.state.name) return;
                  this.setState("name", file.name.split(".")[0]);
                }}"
              />
              <input
                class="${this.styles.fileName}"
                type="text"
                value="${name}"
                @input="${(e) => this.setState("name", e.target.value)}"
                placeholder="사진 이름 입력"
              />
            </div>

            <div class="actions">
              <button @click="${() => this.$refs.sheet.close()}" type="button">
                닫기
              </button>
              <button
                class="primary"
                @click="${() => this.handleUpload()}"
                ?disabled="${!this.state.pendingFile || !this.state.name}"
                type="button"
              >
                확인
              </button>
            </div>
          </form>
        </bottom-sheet>
      `;
    }
  },
);
