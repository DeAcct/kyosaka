//lib/core.js

import resetStyle from "@/styles/base/_reset.scss?inline";
import { patch, updateAttrs, updateProps } from "./diff";
import { createScheduler } from "./schedule";

const sharedResetSheet = new CSSStyleSheet();
sharedResetSheet.replaceSync(resetStyle);

/**
 * 베이스 컴포넌트 클래스
 */
export class Component extends HTMLElement {
  state = {};
  _unsubscribers = [];
  _abortController = null;
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
    this.queueRender = schedule;
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
    this._abortController = new AbortController();
    const { signal } = this._abortController;
    this.setup();
    this.queueRender();
  }

  disconnectedCallback() {
    if (this._abortController) this._abortController.abort();
    this._unsubscribers.forEach((unsub) => unsub());

    this._cancelRender();
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
  }

  $selector(query, all = false) {
    return all
      ? this.shadowRoot.querySelectorAll(query)
      : this.shadowRoot.querySelector(query);
  }

  afterRender() {}

  emit(eventName, option) {
    this.dispatchEvent(new CustomEvent(eventName, option));
  }
}

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

/** * 1. 복잡한 컴포넌트용 define (SCSS 매핑 포함)
 */
export const define =
  (tagName, { mapping, raw } = { mapping: {}, raw: "" }) =>
  (ComponentClass) => {
    const stylesheet = new CSSStyleSheet();
    if (raw) stylesheet.replaceSync(raw);

    // 프로토타입에 스타일 주입 로직 오버라이딩
    ComponentClass.prototype.getStyles = function () {
      return { mapping: mapping || {}, stylesheet };
    };

    if (!customElements.get(tagName)) {
      customElements.define(tagName, ComponentClass);
    }
    return ComponentClass;
  };

/**
 * 2. 단순 컴포넌트용 define
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
  const oldNodes = Array.from(parent.childNodes);
  const max = Math.max(newNodes.length, oldNodes.length);

  for (let i = 0; i < max; i++) {
    patch(parent, newNodes[i], oldNodes[i], i, values, component);
  }
};
