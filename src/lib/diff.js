//lib/diff.js

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
  if (!newNode && oldNode) {
    cleanupEventListeners(oldNode);
    return oldNode.remove();
  }
  let targetNode = oldNode;

  // 2. 생성 및 교체 로직

  if (
    !oldNode ||
    newNode.nodeType !== oldNode.nodeType ||
    newNode.nodeName !== oldNode.nodeName
  ) {
    if (oldNode) cleanupEventListeners(oldNode);
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

/**

 * 🔍 요소 파기 시 자동 청소 설계

 * 요소에 직접 붙은 @ 핸들러와 자식들의 핸들러를 재귀적으로 제거합니다.

 */

function cleanupEventListeners(node) {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return;

  // 1. 해당 요소의 핸들러 제거

  // Object.keys로 _@ 접두사가 붙은 속성을 찾아 리스너를 해제합니다.

  Object.keys(node).forEach((key) => {
    if (key.startsWith("_@")) {
      const eventName = key.replace("_@", "");
      node.removeEventListener(eventName, node[key]);
      delete node[key]; // 참조 삭제
    }
  });

  // 2. 자식 요소들도 모두 뒤져서 청소 (재귀)

  // 부모가 사라지면 자식들도 DOM에서 떨어지므로 함께 청소해야 합니다.

  Array.from(node.childNodes).forEach(cleanupEventListeners);
}

export function updateAttrs(blueprint, target, values) {
  const attrs = Array.from(blueprint.attributes || []);
  attrs.forEach(({ name, value }) => {
    // 1. 특수 바인딩($ , : , @)은 건드리지 않음
    if (name.startsWith(":") || name.startsWith("@") || name.startsWith("$"))
      return;
    if (name === "checked" || name === "disabled") {
      // 속성이 아닌 DOM 프로퍼티를 직접 수정해야 UI가 즉각 반응합니다.

      target[name] = Boolean(value);
      if (value) target.setAttribute(name, "");
      else target.removeAttribute(name);
      return;
    }

    // 🔍 2. value 프로퍼티 처리
    if (
      name === "value" &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
    ) {
      target.value = value;
      return;
    }

    // 2. 🔍 물음표(?) 접두사 처리 (불리언 속성 전용)

    // 예: <details ?open="${index === 0}">

    if (name.startsWith("?")) {
      const realName = name.slice(1); // '?open' -> 'open'
      const match = value.match(/__VAL_(\d+)__/);
      if (match) {
        // 실제 데이터(values)에서 불리언 값을 가져옴

        const boolValue = !!values[match[1]];
        if (boolValue) {
          target.setAttribute(realName, ""); // open 속성 추가
        } else {
          target.removeAttribute(realName); // 🎯 확실히 제거해서 details를 닫음
        }
      }

      // 브라우저가 생성한 가짜 속성(?open)은 DOM에서 즉시 제거

      target.removeAttribute(name);
      return;
    }

    // 3. 🔍 이름 자체가 마커인 경우 처리 (예: <details __VAL_2__>)

    // `${index === 0 ? 'open' : ''}` 같은 코드를 처리합니다.

    const nameMatch = name.match(/^__val_(\d+)__$/i);

    if (nameMatch) {
      const realValue = values[nameMatch[1]];
      if (realValue && typeof realValue === "string") {
        target.setAttribute(realValue, ""); // 'open' 주입
      }
      target.removeAttribute(name); // 쓰레기 마커 삭제
      return;
    }

    // 4. 일반 속성 처리 (class, id 등)

    const finalValue = value.replace(/__VAL_(\d+)__/g, (_, i) => values[i]);
    if (target.getAttribute(name) !== finalValue) {
      target.setAttribute(name, finalValue);
    }
  });
}

export function updateProps(blueprint, target, values, component) {
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

      if (target[`_@${eventName}_`] !== realValue) {
        target.removeEventListener(eventName, target[`_@${eventName}_`]);
        target.addEventListener(eventName, realValue);
        target[`_@${eventName}_`] = realValue;
      }

      target.removeAttribute(name);
    }
  });
}
