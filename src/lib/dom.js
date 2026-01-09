import resetStyle from "@/styles/base/_reset.scss?inline";

import { updateDOM } from "./diff";
const sharedResetSheet = new CSSStyleSheet();
sharedResetSheet.replace(resetStyle);

export class Component extends HTMLElement {
  state = {};
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render(); // 상태 변경 시 자동 리렌더
  }

  /**
   * 자식 컴포넌트들에 복잡한 데이터를 일괄 주입합니다.
   * @param {Object} propMap - { 'selector': { propName: value } } 형태
   */
  applyProps(propMap) {
    Object.entries(propMap).forEach(([selector, props]) => {
      const $targets = this.shadowRoot.querySelectorAll(selector);
      $targets.forEach(($el) => {
        Object.entries(props).forEach(([key, value]) => {
          // 프로퍼티로 데이터 주입 (Setter 작동)
          $el[key] = value;
        });
      });
    });
  }

  /**
   * 저장소를 구독하고 변경 시 자동으로 리렌더링
   * @param {Store} store
   */
  subscribe(store) {
    const unsub = store.subscribe(() => {
      this.render(); // 상태 변경 시 렌더링 호출
    });
    this._unsubscribers.push(unsub);
  }

  _unsubscribers = [];

  static componentStyleSheet = null; // 컴포넌트 클래스별로 시트 공유
  styles = {};

  _abortController = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // 모든 컴포넌트에 공통 리셋 적용
    this.shadowRoot.adoptedStyleSheets = [sharedResetSheet];
  }

  connectedCallback() {
    // 1. 컴포넌트 연결 시 새 컨트롤러 생성
    this._abortController = new AbortController();
    const { signal } = this._abortController;

    this.setup();
    this.setIsolatedEvent(signal); // 전역 이벤트에 signal 전달
    this.render();

    // 2. 이벤트 위임 리스너 등록 시에도 signal 사용
    if (this.initEventListeners) {
      this.initEventListeners(signal);
    }
  }
  disconnectedCallback() {
    // 3. 모든 이벤트 리스너를 한꺼번에 파기
    if (this._abortController) {
      this._abortController.abort();
    }

    this._unsubscribers.forEach((unsub) => unsub());
  }
  /**
   * 컴포넌트에 요소가 주입되기 직전 실행될 것을 여기서 정의한다.
   */
  setup() {}
  /**컴포넌트의 모양을 여기서 정의한다. */
  template() {
    return ``;
  }
  getStyles() {
    return {
      mapping: {},
      stylesheet: null, // 문자열(raw) 대신 시트 객체를 직접 전달받도록 개선 가능
    };
  }

  render() {
    const { mapping, stylesheet } = this.getStyles();
    this.styles = mapping; // 👈 템플릿 생성 및 이벤트 등록에 필수적인 데이터

    if (stylesheet instanceof CSSStyleSheet) {
      this.shadowRoot.adoptedStyleSheets = [sharedResetSheet, stylesheet];
    }

    const templateStr = this.template();
    if (templateStr) {
      // 2. 🔍 핵심 변경: 초기 렌더링 이후에는 updateDOM 사용
      if (this.shadowRoot.innerHTML === "") {
        this.shadowRoot.innerHTML = templateStr;
      } else {
        updateDOM(this.shadowRoot, templateStr);
      }
    }

    this.setEvent();
    this.afterRender();
  }
  /**
   * 가상돔 내부에서 요소를 찾아 반환하는 메서드
   * @param {`.${string}` | `#${string}` | string} query CSS선택자
   * @param {boolean} [all=false] true일 경우 일치하는 모든 요소를 NodeList로 반환한다.
   * @returns {null | Element | NodeList}
   */
  $selector(query, all = false) {
    return all
      ? this.shadowRoot.querySelectorAll(query)
      : this.shadowRoot.querySelector(query);
  }
  afterRender() {}

  /**
   * 재렌더링이 필요한, 요소에 직접 등록하는 이벤트는 여기에서 정의한다.
   */
  setEvent() {}
  /**
   * 이벤트 위임을 사용하여 리렌더링과 상관없이 유지될 이벤트를 정의한다.
   * shadowRoot에 리스너를 걸어 내부 요소가 바뀌어도 이벤트를 캐치한다.
   */
  addEvent(type, selector, callback, options) {
    this.shadowRoot.addEventListener(
      type,
      (event) => {
        const target = event.target.closest(selector);
        if (!target) return;
        callback(event, target);
      },
      options
    ); // 브라우저가 자동으로 관리함
  }
  /** 이벤트 위임 리스너들을 모아두는 곳 */
  initEventListeners() {}
  /**
   * 렌더링과 상관이 없는 이벤트를 여기에서 정의한다.
   * window에 등록하는 이벤트 등
   */
  setIsolatedEvent() {}
}

// lib/component.js 에 추가
export class Stateless extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  // 연결 시점에 딱 한 번만 그립니다.
  connectedCallback() {
    this.render();
  }

  // 외부에서 속성(props)이 바뀔 때만 다시 그릴 수 있도록 최소한의 장치만 마련
  render() {
    const { mapping, stylesheet } = this.getStyles();
    this.styles = mapping || {};

    if (stylesheet instanceof CSSStyleSheet) {
      this.shadowRoot.adoptedStyleSheets = [sharedResetSheet, stylesheet];
    }

    this.shadowRoot.innerHTML = this.template();
  }

  getStyles() {
    return { mapping: {}, stylesheet: null };
  }
  template() {
    return ``;
  }
}

export const define =
  (tagName, { mapping, raw } = { mapping: {}, raw: {} }) =>
  (ComponentClass) => {
    // 1. 전달받은 raw 문자열로 시트 생성 (여기서 딱 한 번만 실행됨)
    const stylesheet = new CSSStyleSheet();

    stylesheet.replaceSync(raw);

    // 2. 컴포넌트 클래스의 getStyles 메서드를 자동으로 오버라이딩
    ComponentClass.prototype.getStyles = function () {
      return {
        mapping,
        stylesheet: stylesheet,
      };
    };

    // 3. 브라우저에 컴포넌트 등록
    if (!customElements.get(tagName)) {
      customElements.define(tagName, ComponentClass);
    }

    return ComponentClass;
  };

export const defineStateless = (tagName) => (ComponentClass) => {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ComponentClass);
  }

  return ComponentClass;
};

/**
 * @template T 반복할 아이템의 타입
 * @param {object | Array<T>} iterable 원본의 타입, 객체나 배열 등 반복 가능할 경우
 */
export const kyFor = (iterable, templateFn) => {
  if (!iterable) {
    return "";
  }

  let _iterable = iterable;
  if (typeof iterable === "object") {
    _iterable = Object.entries(iterable);
  }

  return _iterable.map(templateFn).join("");
};
