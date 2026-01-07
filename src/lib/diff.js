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
  // 1. 새로운 노드가 없으면 삭제
  if (!newNode && oldNode) {
    return oldNode.remove();
  }

  // 2. 이전 노드가 없으면 추가
  if (newNode && !oldNode) {
    return parent.appendChild(newNode);
  }

  // 3. 노드 타입이나 태그가 바뀌었으면 교체 (이때 인스턴스가 파괴됨)
  if (
    newNode.nodeType !== oldNode.nodeType ||
    newNode.nodeName !== oldNode.nodeName
  ) {
    return parent.replaceChild(newNode, oldNode);
  }

  // 4. 텍스트 내용이 다르면 업데이트
  if (
    newNode.nodeType === Node.TEXT_NODE &&
    newNode.textContent !== oldNode.textContent
  ) {
    oldNode.textContent = newNode.textContent;
    return;
  }

  // 5. 엘리먼트일 경우 속성(Attribute) 비교 및 업데이트
  if (newNode.nodeType === Node.ELEMENT_NODE) {
    updateAttributes(newNode, oldNode);
    updateProperties(newNode, oldNode); // 추가: input value, checked 등

    // 자식 노드 재귀적 diffing
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
  // input, textarea, select 등의 value 속성 동기화
  if ("value" in newNode && newNode.value !== oldNode.value) {
    oldNode.value = newNode.value;
  }

  // checkbox, radio의 checked 속성 동기화
  if ("checked" in newNode && newNode.checked !== oldNode.checked) {
    oldNode.checked = newNode.checked;
  }

  // select의 selectedIndex 동기화
  if (
    "selectedIndex" in newNode &&
    newNode.selectedIndex !== oldNode.selectedIndex
  ) {
    oldNode.selectedIndex = newNode.selectedIndex;
  }
}
