import { Component, define, html } from "@/lib/core";
import { galleryStore } from "@/store/galleryStore";

import mapping from "./uploadSheet.module.scss";
import raw from "./uploadSheet.module.scss?inline";

import "@/components/ModalSheet/ModalSheet";
import "@/components/RadioGroup/RadioGroup";

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
      if (this.state.previewUrl) {
        URL.revokeObjectURL(this.state.previewUrl);
      }

      this.setState("pendingFile", null);
      this.setState("previewUrl", "");
      this.setState("name", "");
      this.setState("selectedType", "memory");

      // 3. 네이티브 input 값 초기화 (같은 파일을 다시 올릴 때 change 이벤트 보장)
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    }

    set selected(value) {
      if (value) {
        this.setState("selectedType", value);
      }
    }

    open() {
      this.$refs.sheet.open();
    }

    openFile(e) {
      const file = e.target.files[0];
      if (!file) return;

      // 이전 프리뷰가 있다면 메모리 해제
      if (this.state.previewUrl) {
        URL.revokeObjectURL(this.state.previewUrl);
      }

      const imageUrl = URL.createObjectURL(file);

      this.setState("pendingFile", file);
      this.setState("previewUrl", imageUrl);

      // 이름이 비어있을 때만 파일명으로 채움
      if (!this.state.name) {
        this.setState("name", file.name.split(".")[0]);
      }
    }

    async handleUpload() {
      const { pendingFile, selectedType, name } = this.state;
      if (!pendingFile) return;

      await galleryStore.saveItem(pendingFile, selectedType, name);
      this.$refs.sheet.close();
      this.reset();
    }

    template() {
      const { name, selectedType, pendingFile, previewUrl } = this.state;
      console.log(selectedType);

      const previewStyle = previewUrl
        ? `background-image: linear-gradient(rgb(0 0 0 / 0.6), rgb(0 0 0 / 0.3)), url(${previewUrl}); color: white;`
        : "";
      return html`
        <modal-sheet $sheet @close="${this.reset}">
          <div class="${this.styles.uploadSheet}">
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

            <button
              class="${this.styles.picker}"
              @click="${() => this.$refs.fileInput.click()}"
              style="${previewStyle}"
              type="button"
              $preview
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
                this.openFile(e);
              }}"
              accept="image/*"
            />
            <input
              class="${this.styles.fileName}"
              type="text"
              value="${name}"
              @input="${(e) => this.setState("name", e.target.value)}"
              placeholder="사진 이름 입력"
              name="fileName"
              required
            />

            <div class="${this.styles.actions}">
              <button
                @click="${() => this.$refs.sheet.close()}"
                type="button"
                class="${this.styles.button}"
              >
                취소
              </button>
              <button
                class="${this.styles.button} ${this.styles.primary}"
                @click="${() => this.handleUpload()}"
                ?disabled="${!this.state.pendingFile || !this.state.name}"
                type="button"
              >
                업로드
              </button>
            </div>
          </div>
        </modal-sheet>
      `;
    }
  },
);
