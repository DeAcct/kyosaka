import { Component, define, html } from "@/lib/core";
import { router } from "@/lib/router";
import { galleryStore } from "@/store/galleryStore";

import mapping from "./gallery.layout.module.scss";
import raw from "./gallery.layout.module.scss?inline";

import { ControlBar } from "@/components/ControlBar/ControlBar";
import { Icon } from "@/components/Icon/Icon";
import { MemoryOverlay } from "@/components/MemoryOverlay/MemoryOverlay";
import { SwipeWrap } from "@/components/SwipeWrap/SwipeWrap";
import { TabSelector } from "@/components/TabSelector/TabSelector";
import { UploadSheet } from "@/components/UploadSheet/UploadSheet";
import { PasswordModal } from "@/components/PasswordModal/PasswordModal";
import "@/components/ContextMenu/ContextMenu";

const TABS = [
  {
    name: "추억",
    to: "/gallery/memory",
  },
  {
    name: "개인정보",
    to: "/gallery/private",
  },
];

export const GalleryLayout = define("layout-gallery", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(galleryStore);
    }

    async afterOnce() {
      await galleryStore.hydrate();
      if (galleryStore.isLocked) {
        this.openUnlockModal();
      }
    }

    onDisconnected() {
      galleryStore.lock();
    }

    openUnlockModal() {
      if (this.$refs.passwordModal) {
        this.$refs.passwordModal.open("unlock");
      }
    }

    handleLockClick() {
      if (galleryStore.isLocked) {
        if (this.$refs.passwordModal) {
          this.$refs.passwordModal.open("unlock");
        }
      } else if (galleryStore.hasPassword) {
        if (this.$refs.contextMenu) {
          this.$refs.contextMenu.open({
            title: "보안 설정",
            options: [
              {
                text: "지금 잠그기",
                icon: "lock",
                action: () => {
                  galleryStore.lock();
                },
              },
              {
                text: "비밀번호 변경",
                icon: "edit",
                action: () => {
                  if (this.$refs.passwordModal) {
                    this.$refs.passwordModal.open("set");
                  }
                },
              },
              {
                text: "비밀번호 해제",
                icon: "delete",
                danger: true,
                action: async () => {
                  await galleryStore.clearPassword();
                },
              },
            ],
          });
        }
      } else {
        if (this.$refs.passwordModal) {
          this.$refs.passwordModal.open("set");
        }
      }
    }

    gallerySwipe({ detail }) {
      const { pathname } = location;
      const nowIndex = TABS.findIndex(({ to }) => to === pathname);
      const step = detail.direction === "right" ? 1 : -1;
      const nextIndex = (nowIndex + TABS.length + step) % 2;
      router.navigate(TABS[nextIndex].to);
    }

    get nowPage() {
      const { pathname } = location;
      const [, , leafNode] = pathname.split("/");
      return leafNode;
    }

    template() {
      const isLocked = galleryStore.isLocked;

      return html`
        <div class="${this.styles.gallery}">
          <nav class="${this.styles.tabBar}">
            <tab-selector :tabs="${TABS}"></tab-selector>
          </nav>
          ${isLocked
            ? html`
                <div class="${this.styles.lockedOverlay}">
                  <ky-icon
                    name="lock"
                    class="${this.styles.lockIcon}"
                  ></ky-icon>
                  <p class="${this.styles.lockMessage}">
                    비밀번호로 잠겨 있습니다.
                  </p>
                  <button
                    type="button"
                    class="${this.styles.unlockButton}"
                    @click="${() => this.openUnlockModal()}"
                  >
                    잠금 해제
                  </button>
                </div>
              `
            : html`
                <swipe-wrap
                  @swipe="${(e) => {
                    this.gallerySwipe(e);
                  }}"
                >
                  <div class="${this.styles.swipeHitArea}">
                    <slot></slot>
                  </div>
                </swipe-wrap>
              `}

          <control-bar
            class="${this.styles.controller} ${isLocked
              ? this.styles.hideController
              : ""} ${galleryStore.mode === "edit"
              ? this.styles.editMode
              : ""}"
            :mode="${galleryStore.mode}"
          >
            <span slot="counter">${galleryStore.selected.length}개 선택됨</span>

            ${galleryStore.mode !== "edit"
              ? html`
                  <button
                    slot="actions"
                    class="${this.styles.lockButton}"
                    type="button"
                    @click="${() => this.handleLockClick()}"
                  >
                    <ky-icon
                      name="${isLocked ? "lock_open" : "lock"}"
                      class="${this.styles.icon}"
                    ></ky-icon>
                  </button>
                `
              : ""}

            <button
              slot="actions"
              class="${this.styles.upload} ${galleryStore.mode === "edit"
                ? this.styles.cancel
                : ""}"
              type="button"
              @click="${() => {
                if (galleryStore.mode === "view") {
                  if (galleryStore.isLocked) {
                    this.openUnlockModal();
                  } else {
                    this.$refs.uploadSheet.open();
                  }
                } else {
                  galleryStore.toggleEditMode();
                }
              }}"
            >
              <ky-icon
                name="${galleryStore.mode === "edit" ? "add" : "export"}"
                class="${this.styles.icon}"
              ></ky-icon>
              <span
                class="${this.styles.text} ${galleryStore.mode !== "edit"
                  ? this.styles.show
                  : ""}"
                >새 사진</span
              >
            </button>

            ${galleryStore.mode === "edit"
              ? html`
                  <button
                    slot="actions"
                    type="button"
                    class="${this.styles.deleteButton}"
                    @click="${() => galleryStore.deleteSelectedItems()}"
                  >
                    <ky-icon
                      class="${this.styles.icon}"
                      name="delete"
                    ></ky-icon>
                  </button>
                `
              : ""}
          </control-bar>

          <upload-sheet
            $upload-sheet
            :selected="${this.nowPage}"
          ></upload-sheet>

          <password-modal $password-modal></password-modal>

          <context-menu $context-menu></context-menu>

          ${galleryStore.mode === "overlay"
            ? html` <memory-overlay></memory-overlay> `
            : ""}
        </div>
      `;
    }
  },
);
