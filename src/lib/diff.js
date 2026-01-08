// lib/dom.js (또는 Component 내부 유틸리티)
export const updateDOM = (parent, newHTML) => {
  // 1. 템플릿 문자열을 DocumentFragment로 변환
  const template = document.createElement("template");
  template.innerHTML = newHTML;
  const newNodes = Array.from(template.content.childNodes);
  const oldNodes = Array.from(parent.childNodes);

  const max = Math.max(newNodes.length, oldNodes.length);
  for (let i = 0; i < max; i++) {
    patch(parent, newNodes[i], oldNodes[i], i);
  }
};

function patch(parent, newNode, oldNode, index) {
  if (!newNode && oldNode) return oldNode.remove();
  if (newNode && !oldNode) return parent.appendChild(newNode);

  // 🔍 1. Key 기반 비교 추가 (재사용 오류 원천 봉쇄)
  const newKey = newNode.getAttribute?.("key");
  const oldKey = oldNode.getAttribute?.("key");

  if (
    newNode.nodeType !== oldNode.nodeType ||
    newNode.nodeName !== oldNode.nodeName ||
    newKey !== oldKey // Key가 다르면 아예 다른 요소로 간주하고 새로 생성
  ) {
    return parent.replaceChild(newNode, oldNode);
  }

  if (newNode.nodeType === Node.TEXT_NODE) {
    if (newNode.textContent !== oldNode.textContent)
      oldNode.textContent = newNode.textContent;
    return;
  }

  if (newNode.nodeType === Node.ELEMENT_NODE) {
    updateAttributes(newNode, oldNode);
    updateProperties(newNode, oldNode);

    // 🔍 2. 커스텀 컴포넌트 강제 리렌더링 (필요 시)
    // 속성이 바뀌었을 때 컴포넌트 내부에서 감지하지 못한다면 명시적으로 알려줘야 합니다.
    if (oldNode.tagName.includes("-") && typeof oldNode.render === "function") {
      oldNode.render();
    }

    const newChildren = Array.from(newNode.childNodes);
    const oldChildren = Array.from(oldNode.childNodes);
    const max = Math.max(newChildren.length, oldChildren.length);

    for (let i = 0; i < max; i++) {
      patch(oldNode, newChildren[i], oldChildren[i], i);
    }
  }
}

function updateAttributes(newNode, oldNode) {
  // 변경되거나 추가된 속성 적용
  const newAttrs = newNode.attributes;
  const oldAttrs = oldNode.attributes;

  for (let i = 0; i < newAttrs.length; i++) {
    const { name, value } = newAttrs[i];
    if (oldNode.getAttribute(name) !== value) {
      oldNode.setAttribute(name, value);
    }
  }

  // 사라진 속성 제거
  for (let i = oldAttrs.length - 1; i >= 0; i--) {
    const { name } = oldAttrs[i];
    if (!newNode.hasAttribute(name)) {
      oldNode.removeAttribute(name);
    }
  }
}

function updateProperties(newNode, oldNode) {
  // 기존 폼 요소 동기화... (value, checked 등)

  // 🔍 3. 커스텀 컴포넌트의 데이터 속성(Prop) 동기화 확장
  // 만약 컴포넌트가 'data'라는 프로퍼티를 직접 사용한다면 이를 넘겨줘야 합니다.
  if (oldNode.tagName.includes("-")) {
    // 예: route-card의 데이터가 속성이 아닌 프로퍼티로 관리될 경우
    for (const key of Object.keys(newNode)) {
      if (key.startsWith("_") || typeof newNode[key] === "function") continue;
      if (oldNode[key] !== newNode[key]) {
        oldNode[key] = newNode[key];
      }
    }
  }
}
