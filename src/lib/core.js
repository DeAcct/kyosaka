//lib/core.js

import resetStyle from "@/styles/base/_reset.scss?inline";
import { patch, updateAttrs, updateProps } from "./diff";
import { createScheduler } from "./schedule";
export { block } from "./block";

const sharedResetSheet = new CSSStyleSheet();
sharedResetSheet.replaceSync(resetStyle);

let isSyncMode = false;
export const flushSync = (callback) => {
  const prev = isSyncMode;
  isSyncMode = true;
  try {
    callback(); // 이 안에서 발생하는 모든 setState는 동기적으로 처리됨
  } finally {
    isSyncMode = prev; // 원래 모드(비동기)로 복구
  }
};

/**
 * 베이스 컴포넌트 클래스
 */
export const withComponent = (Base = HTMLElement) =>
  class extends Base {
    state = {};
    _unsubscribers = [];
    styles = {};
    $refs = {};

    static shadowOptions = { mode: "open" };
    _internals = null;
    static formAssociated = false;

    _renderAnimationFrameId = null;

    constructor() {
      super();
      const options = this.constructor.shadowOptions || { mode: "open" };

      const { schedule, cancel } = createScheduler(() => this.render());
      this.queueRender = () => {
        if (isSyncMode) {
          this.render();
        } else {
          schedule();
        }
      };
      this._cancelRender = cancel;

      if (!this.shadowRoot) {
        this.attachShadow(options);
      }
      if (this.constructor.formAssociated) {
        this._internals = this.attachInternals();
      }
      this.shadowRoot.adoptedStyleSheets = [sharedResetSheet];
    }

    setState(key, newState) {
      this.state = { ...this.state, [key]: newState };
      this.queueRender();
    }

    subscribe(store) {
      const unsub = store.subscribe(() => this.queueRender());
      this._unsubscribers.push(unsub);
    }

    connectedCallback() {
      this.setup();
      this.queueRender();
    }

    onPropsPatchComplete() {
      // 횡적으로 여러 프로퍼티(type, activeDate 등)가 동시에 들어와도
      // 루프가 다 끝난 시점이라 "단 한 번만" 정갈하게 동기식 리렌더링이 일어납니다.
      if (this.isConnected) {
        this.render();
      }
    }

    disconnectedCallback() {
      this._unsubscribers.forEach((unsub) => unsub());

      this._cancelRender();
      this.onDisconnected();
    }

    setup() {}
    template() {
      return html``;
    }
    getStyles() {
      return { mapping: {}, stylesheet: null };
    }

    render() {
      this._cancelRender();

      const { mapping, stylesheet } = this.getStyles();
      this.styles = mapping;

      if (stylesheet instanceof CSSStyleSheet) {
        this.shadowRoot.adoptedStyleSheets = [sharedResetSheet, stylesheet];
      }

      const templateResult = this.template();
      if (templateResult) {
        this.$refs = {};
        updateDOM(this.shadowRoot, templateResult, this);
      }

      this.afterRender();
      if (!this.reRendered) this.afterOnce();
      this.reRendered = true;
    }

    $selector(query, all = false) {
      return all
        ? this.shadowRoot.querySelectorAll(query)
        : this.shadowRoot.querySelector(query);
    }

    afterRender() {}
    afterOnce() {}

    onDisconnected() {}

    emit(eventName, option) {
      this.dispatchEvent(new CustomEvent(eventName, option));
    }
  };

export class Component extends withComponent(HTMLElement) {}

/**
 * 상태가 없는 단순 컴포넌트용 클래스
 */
export class Stateless extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const { mapping, stylesheet } = this.getStyles();
    this.styles = mapping || {};
    if (stylesheet instanceof CSSStyleSheet) {
      this.shadowRoot.adoptedStyleSheets = [sharedResetSheet, stylesheet];
    }
    const result = this.template();
    if (result) updateDOM(this.shadowRoot, result, this);
  }
  getStyles() {
    return { mapping: {}, stylesheet: null };
  }
  template() {
    return html``;
  }
}

/** 상태가 포함된 컴포넌트를 정의합니다.
 */
export const define =
  (
    tagName,
    { mapping, raw, extends: extendTag } = {
      mapping: {},
      raw: "",
      extends: null,
    },
  ) =>
  (ComponentClass) => {
    const stylesheet = new CSSStyleSheet();
    if (raw) stylesheet.replaceSync(raw);

    ComponentClass.prototype.getStyles = function () {
      return { mapping: mapping || {}, stylesheet };
    };

    if (!customElements.get(tagName)) {
      // 3번째 인자로 extends 옵션 전달
      const options = extendTag ? { extends: extendTag } : undefined;
      customElements.define(tagName, ComponentClass, options);
    }
    return ComponentClass;
  };

/**상태가 없는 불변 컴포넌트를 정의합니다.
 */
export const defineStateless = (tagName) => (ComponentClass) => {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ComponentClass);
  }
  return ComponentClass;
};

/**
 * 반복 헬퍼 (배열을 반환하여 patch가 처리하게 함)
 */
export const kyFor = (iterable, templateFn) => {
  if (!iterable) return [];
  const list = Array.isArray(iterable) ? iterable : Object.entries(iterable);
  return list.map(templateFn);
};

/**
 * Tagged Template Literal
 */
export const html = (strings, ...values) => ({ strings, values });

/**
 * 렌더링 엔진
 */
export const updateDOM = (parent, templateResult, component) => {
  const { strings, values } = templateResult;
  const fullHTML = strings.reduce(
    (acc, str, i) => acc + str + (i < values.length ? `__VAL_${i}__` : ""),
    "",
  );

  const temp = document.createElement("template");
  temp.innerHTML = fullHTML;

  const splitTextNodes = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const markerRegex = /(__VAL_\d+__)/g;
      if (markerRegex.test(text)) {
        const parts = text.split(markerRegex);
        if (parts.length > 3 || parts[0] !== "" || parts[2] !== "") {
          const parent = node.parentNode;
          parts.forEach((part) => {
            if (part) parent.insertBefore(document.createTextNode(part), node);
          });
          node.remove();
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(splitTextNodes);
    }
  };
  Array.from(temp.content.childNodes).forEach(splitTextNodes);

  const globalEventBinderElement = temp.content.querySelector("global");
  if (globalEventBinderElement) {
    if (component._globalHandlers) {
      component._globalHandlers.forEach(({ target, type, handler }) => {
        target.removeEventListener(type, handler);
      });
    }
    component._globalHandlers = [];

    Array.from(globalEventBinderElement.attributes).forEach((attr) => {
      if (attr.name.startsWith("@")) {
        const eventName = attr.name.slice(1);
        const match = attr.value.match(/__VAL_(\d+)__/);

        if (match) {
          const handler = values[match[1]].bind(component);
          const target = window;

          target.addEventListener(eventName, handler);
          component._globalHandlers.push({ target, type: eventName, handler });
        }
      }
    });
    globalEventBinderElement.remove();
  }

  const hostEventBinderElement = temp.content.querySelector("host");
  if (hostEventBinderElement) {
    updateAttrs(hostEventBinderElement, component, values);
    updateProps(hostEventBinderElement, component, values, component);
    hostEventBinderElement.remove();
  }

  // 기존 텍스트 마커/앵커 처리 로직... (생략)

  const newNodes = Array.from(temp.content.childNodes);
  let currentOldNode = parent.firstChild;

  newNodes.forEach((newNode) => {
    const oldNode = currentOldNode;

    // 🎯 동일하게 루트 레벨의 배열 블록 건너뛰기 처리
    if (
      oldNode &&
      oldNode.nodeType === Node.COMMENT_NODE &&
      oldNode._arrayMarker !== undefined &&
      oldNode._arrayAnchorType === "start"
    ) {
      let current = oldNode.nextSibling;
      while (current) {
        if (
          current.nodeType === Node.COMMENT_NODE &&
          current._arrayMarker === oldNode._arrayMarker &&
          current._arrayAnchorType === "end"
        ) {
          current = current.nextSibling;
          break;
        }
        current = current.nextSibling;
      }
      currentOldNode = current;
    } else {
      currentOldNode = oldNode ? oldNode.nextSibling : null;
    }

    patch(parent, newNode, oldNode, 0, values, component);
  });

  // 불필요해진 남은 노드들 청소
  while (currentOldNode) {
    const next = currentOldNode.nextSibling;
    patch(parent, null, currentOldNode, 0, values, component);
    currentOldNode = next;
  }
};
