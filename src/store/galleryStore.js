import Store from "@/lib/store";
import CryptoJS from "crypto-js";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(",");
  if (parts.length < 2) return null;
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

class GalleryStore extends Store {
  CACHE_NAME = "kyosaka-gallery";
  tempUrls = new Map();
  sessionPassword = "";

  get hasPassword() {
    return Boolean(this.state.passwordHash);
  }

  get isLocked() {
    return Boolean(this.state.passwordHash && !this.state.isUnlocked);
  }

  get mode() {
    return this.state.ui.mode;
  }

  get selected() {
    return this.state.ui.selected;
  }

  async hydrate() {
    this.commit("isLoading", true);

    if (this.isLocked) {
      this.clearTempUrls();
      this.commit("isLoading", false);
      return;
    }

    const cache = await caches.open(this.CACHE_NAME);

    await Promise.all(
      this.state.items.map(async (item) => {
        const response = await cache.match(item.id);
        if (!response) return;

        try {
          const blob = await response.blob();

          if (blob.type && blob.type.startsWith("image/")) {
            this.tempUrls.set(item.id, URL.createObjectURL(blob));
            return;
          }

          const content = await blob.text();

          if (content.startsWith("data:")) {
            const b = dataUrlToBlob(content);
            if (b) {
              this.tempUrls.set(item.id, URL.createObjectURL(b));
              return;
            }
          }

          if (this.sessionPassword) {
            try {
              const bytes = CryptoJS.AES.decrypt(content, this.sessionPassword);
              const decryptedDataUrl = bytes.toString(CryptoJS.enc.Utf8);
              if (decryptedDataUrl && decryptedDataUrl.startsWith("data:")) {
                const b = dataUrlToBlob(decryptedDataUrl);
                if (b) {
                  this.tempUrls.set(item.id, URL.createObjectURL(b));
                  return;
                }
              }
            } catch (decErr) {
              // 복호화 실패 시 폴백
            }
          }

          if (blob.size > 0) {
            const imageBlob = blob.type
              ? blob
              : new Blob([blob], { type: "image/jpeg" });
            this.tempUrls.set(item.id, URL.createObjectURL(imageBlob));
          }
        } catch (e) {
          console.error("Hydrate error for item:", item.id, e);
        }
      }),
    );

    this.commit("isLoading", false);
  }

  async saveItem(file, type, customName) {
    const id = crypto.randomUUID();
    const cache = await caches.open(this.CACHE_NAME);
    const dataUrl = await fileToDataUrl(file);

    let storagePayload = dataUrl;
    if (this.hasPassword && this.sessionPassword) {
      storagePayload = CryptoJS.AES.encrypt(
        dataUrl,
        this.sessionPassword,
      ).toString();
    }

    await cache.put(id, new Response(storagePayload));

    const blob = file;
    const url = URL.createObjectURL(blob);
    this.tempUrls.set(id, url);

    const newItem = { id, type, name: customName || file.name };
    this.commit("items", [...this.state.items, newItem]);
  }

  verifyPassword(inputPassword) {
    const hash = CryptoJS.SHA256(inputPassword).toString();
    if (hash === this.state.passwordHash) {
      this.sessionPassword = inputPassword;
      this.commit("isUnlocked", true);
      this.hydrate();
      return true;
    }
    return false;
  }

  async setPassword(newPassword) {
    const newHash = CryptoJS.SHA256(newPassword).toString();
    const oldPassword = this.sessionPassword;

    if (this.state.items.length > 0) {
      const cache = await caches.open(this.CACHE_NAME);
      await Promise.all(
        this.state.items.map(async (item) => {
          const response = await cache.match(item.id);
          if (response) {
            const blob = await response.blob();
            const content = await blob.text();
            let dataUrl = "";

            if (content.startsWith("data:")) {
              dataUrl = content;
            } else if (oldPassword) {
              try {
                const bytes = CryptoJS.AES.decrypt(content, oldPassword);
                dataUrl = bytes.toString(CryptoJS.enc.Utf8);
              } catch (e) {
                dataUrl = "";
              }
            }

            if (!dataUrl || !dataUrl.startsWith("data:")) {
              dataUrl = await fileToDataUrl(blob);
            }

            if (dataUrl) {
              const encrypted = CryptoJS.AES.encrypt(
                dataUrl,
                newPassword,
              ).toString();
              await cache.put(item.id, new Response(encrypted));
            }
          }
        }),
      );
    }

    this.sessionPassword = newPassword;
    this.commit("passwordHash", newHash);
    this.commit("isUnlocked", true);
    this.hydrate();
    return true;
  }

  async clearPassword() {
    if (this.hasPassword && this.sessionPassword) {
      const cache = await caches.open(this.CACHE_NAME);
      await Promise.all(
        this.state.items.map(async (item) => {
          const response = await cache.match(item.id);
          if (response) {
            const blob = await response.blob();
            const content = await blob.text();
            let dataUrl = "";

            if (content.startsWith("data:")) {
              dataUrl = content;
            } else {
              try {
                const bytes = CryptoJS.AES.decrypt(
                  content,
                  this.sessionPassword,
                );
                dataUrl = bytes.toString(CryptoJS.enc.Utf8);
              } catch (e) {
                dataUrl = "";
              }
            }

            if (dataUrl && dataUrl.startsWith("data:")) {
              const rawBlob = dataUrlToBlob(dataUrl);
              if (rawBlob) {
                await cache.put(item.id, new Response(rawBlob));
              }
            }
          }
        }),
      );
    }

    this.sessionPassword = "";
    this.commit("passwordHash", "");
    this.commit("isUnlocked", false);
    this.hydrate();
  }

  lock() {
    this.clearTempUrls();
    this.sessionPassword = "";
    this.commit("isUnlocked", false);
    this.commit("isLoading", false);
  }

  clearTempUrls() {
    this.tempUrls.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.tempUrls.clear();
  }

  toggleEditMode() {
    this.commit("ui/selected", []);
    const nextMode = this.mode === "view" ? "edit" : "view";
    this.commit("ui/mode", nextMode);
  }

  toggleItemSelection(id) {
    if (this.state.ui.mode !== "edit") return;

    const selected = this.state.ui.selected;
    const isSelected = selected.includes(id);
    const next = isSelected
      ? selected.filter((v) => v !== id)
      : [...selected, id];

    this.commit("ui/selected", next);
  }

  async deleteSelectedItems() {
    const targets = this.state.ui.selected;
    if (targets.length === 0) return;

    const cache = await caches.open(this.CACHE_NAME);

    targets.forEach((id) => {
      cache.delete(id);
      if (this.tempUrls.has(id)) {
        URL.revokeObjectURL(this.tempUrls.get(id));
        this.tempUrls.delete(id);
      }
    });

    const nextItems = this.state.items.filter(
      (item) => !targets.includes(item.id),
    );

    this.commit("items", nextItems);
    this.clearUI();
  }

  openOverlay(id) {
    this.commit("ui", { selected: [id], mode: "overlay" });
  }

  clearUI() {
    this.commit("ui", { selected: [], mode: "view" });
  }

  findItemById(targetId) {
    return this.state.items.find(({ id }) => id === targetId);
  }
}

export const galleryStore = new GalleryStore(
  "galleryStore",
  {
    items: [],
    isLoading: false,
    passwordHash: "",
    isUnlocked: false,
    ui: {
      selected: [],
      mode: "view",
    },
  },
  { exclude: ["ui", "isUnlocked"] },
);
