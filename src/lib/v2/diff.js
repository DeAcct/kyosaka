// lib/diff.js

/**
 * html`...` 결과물이나 배열을 실제 DOM 노드로 변환
 */
function renderValue(value, component) {
  if (Array.isArray(value)) {
    const fragment = document.createDocumentFragment();
    value.forEach((item) => fragment.appendChild(renderValue(item, component)));
    return fragment;
  }

  if (value && typeof value === "object" && value.strings) {
    const temp = document.createElement("template");
    temp.innerHTML = value.strings.reduce(
      (acc, str, i) =>
        acc + str + (i < value.values.length ? `__VAL_${i}__` : ""),
      ""
    );

    const fragment = temp.content;
    // 생성된 프래그먼트 내부의 마커들도 해소 (values를 알 수 없으므로 nestedValues 사용)
    Array.from(fragment.childNodes).forEach((node) => {
      resolveMarkers(node, value.values, component);
    });
    return fragment;
  }
  return document.createTextNode(String(value ?? ""));
}

/**
 * 단순 마커 치환 (속성, 프로퍼티, 일반 텍스트용)
 */
function resolveMarkers(node, values, component) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    const match = text.match(/__VAL_(\d+)__/);
    if (match) {
      const realValue = values[match[1]];
      // 🔍 배열이나 TemplateResult인 경우 통째로 교체
      if (Array.isArray(realValue) || (realValue && realValue.strings)) {
        node.parentNode.replaceChild(renderValue(realValue, component), node);
        return true;
      }
      node.textContent = text.replace(/__VAL_(\d+)__/g, (_, i) => values[i]);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    updateAttrs(node, node, values);
    updateProps(node, node, values, component);
    Array.from(node.childNodes).forEach((child) =>
      resolveMarkers(child, values, component)
    );
  }
  return false;
}

export function patch(parent, newNode, oldNode, index, values, component) {
  // 1. 삭제 처리
  if (!newNode && oldNode) return oldNode.remove();

  let targetNode = oldNode;

  // 2. 생성 및 교체 로직
  if (
    !oldNode ||
    newNode.nodeType !== oldNode.nodeType ||
    newNode.nodeName !== oldNode.nodeName
  ) {
    targetNode = newNode.cloneNode(true);
    if (!oldNode) parent.appendChild(targetNode);
    else parent.replaceChild(targetNode, oldNode);
  }

  // 3. 텍스트 노드 처리
  if (newNode.nodeType === Node.TEXT_NODE) {
    const text = newNode.textContent;
    const match = text.match(/__VAL_(\d+)__/);

    if (match) {
      const realValue = values[match[1]];

      // 🔍 배열이나 중첩 템플릿인 경우: 노드 교체 후 즉시 종료
      if (
        Array.isArray(realValue) ||
        (typeof realValue === "object" &&
          realValue !== null &&
          realValue.strings)
      ) {
        parent.replaceChild(renderValue(realValue, component), targetNode);
        return; // 이 경로는 하위 자식이 없으므로 종료
      }

      // 일반 문자열 치환
      const finalValue = text.replace(/__VAL_(\d+)__/g, (_, i) => values[i]);
      if (targetNode.textContent !== finalValue)
        targetNode.textContent = finalValue;
    }
    return;
  }

  // 4. 엘리먼트 노드 처리
  if (newNode.nodeType === Node.ELEMENT_NODE) {
    updateAttrs(newNode, targetNode, values);
    updateProps(newNode, targetNode, values, component);

    if (
      targetNode.tagName.includes("-") &&
      typeof targetNode.render === "function"
    ) {
      targetNode.render();
    }

    // 자식 패치 재귀
    const newChildren = Array.from(newNode.childNodes);
    const oldChildren = Array.from(targetNode.childNodes);
    const max = Math.max(newChildren.length, oldChildren.length);

    for (let i = 0; i < max; i++) {
      patch(targetNode, newChildren[i], oldChildren[i], i, values, component);
    }
  }
}

function updateAttrs(blueprint, target, values) {
  const attrs = Array.from(blueprint.attributes || []);
  attrs.forEach(({ name, value }) => {
    if (name.startsWith(":") || name.startsWith("@")) return;
    const finalValue = value.replace(/__VAL_(\d+)__/g, (_, i) => values[i]);
    if (target.getAttribute(name) !== finalValue)
      target.setAttribute(name, finalValue);
  });
}

function updateProps(blueprint, target, values, component) {
  const attrs = Array.from(blueprint.attributes || []);
  attrs.forEach(({ name, value }) => {
    if (name.startsWith("$") && component) {
      const refName = name.slice(1); // '$canvas' -> 'canvas'
      const existing = component.$refs[refName];

      if (!existing) {
        component.$refs[refName] = target; // 인스턴스에 저장
      } else if (Array.isArray(existing)) {
        existing.push(target);
      } else {
        component.$refs[refName] = [existing, target];
      }

      target.removeAttribute(name); // 깔끔하게 속성 제거
      return;
    }

    const match = value.match(/__VAL_(\d+)__/);
    if (!match) return;
    const realValue = values[match[1]];
    if (name.startsWith(":")) {
      const propName = name.slice(1);
      if (target[propName] !== realValue) target[propName] = realValue;
      target.removeAttribute(name);
    } else if (name.startsWith("@")) {
      const eventName = name.slice(1);
      if (target[`_handler_${eventName}`] !== realValue) {
        target.removeEventListener(eventName, target[`_handler_${eventName}`]);
        target.addEventListener(eventName, realValue);
        target[`_handler_${eventName}`] = realValue;
      }
      target.removeAttribute(name);
    }
  });
}
