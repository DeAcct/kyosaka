//lib/diff.js

/**
 * 🔥 배열 렌더링 추적 시스템
 */

// 배열 앵커 생성
function createArrayAnchor(markerId) {
  const comment = document.createComment(`array-${markerId}`);
  comment._arrayMarker = markerId;
  return comment;
}

/**
 * html`...` 결과물이나 배열을 실제 DOM 노드로 변환
 */
function renderValue(value, component) {
  if (Array.isArray(value)) {
    const fragment = document.createDocumentFragment();
    value.forEach((item) => {
      fragment.appendChild(renderValue(item, component));
    });
    return fragment;
  }

  if (value && typeof value === "object" && value.strings) {
    const temp = document.createElement("template");
    temp.innerHTML = value.strings.reduce(
      (acc, str, i) =>
        acc + str + (i < value.values.length ? `__VAL_${i}__` : ""),
      "",
    );
    const fragment = temp.content;

    Array.from(fragment.childNodes).forEach((node) => {
      resolveMarkers(node, value.values, component);
    });
    return fragment;
  }

  // 🎯 undefined나 null일 경우 "undefined" 문자가 아니라 빈 문자열 노드 생성
  return document.createTextNode(
    value === undefined || value === null ? "" : String(value),
  );
}

/**
 * 초기 렌더링 시 마커 해석
 */
function resolveMarkers(node, values, component) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    const markerRegex = /(__VAL_\d+__)/g; // 🔍 마커를 캡처 그룹으로 분리

    if (markerRegex.test(text)) {
      const parent = node.parentNode;
      const parts = text.split(markerRegex); // 🎯 마커와 일반 텍스트를 배열로 쪼갬

      parts.forEach((part) => {
        if (!part) return;

        const match = part.match(/__VAL_(\d+)__/);
        if (match) {
          const markerId = match[1];
          const realValue = values[markerId];

          // 🎯 여기서 renderValue를 실행하여 배열이나 템플릿을 실제 노드로 변환
          const rendered = renderValue(realValue, component);

          if (Array.isArray(realValue)) {
            // 배열이면 앵커(Comment)를 만들고 그 뒤에 렌더링 결과 삽입
            const anchor = createArrayAnchor(markerId);
            parent.insertBefore(anchor, node);
            parent.insertBefore(rendered, node);
          } else {
            parent.insertBefore(rendered, node);
          }
        } else {
          // 마커가 아닌 순수 텍스트 조각
          parent.insertBefore(document.createTextNode(part), node);
        }
      });

      node.remove(); // 🎯 모든 조각을 삽입했으므로 원본 마커 텍스트 노드 제거
      return;
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    updateAttrs(node, node, values);
    updateProps(node, node, values, component);
    // 🔍 자식 순회 시 Array.from으로 스냅샷을 찍어야 노드 삭제/추가 시 인덱스가 안 꼬임
    Array.from(node.childNodes).forEach((child) =>
      resolveMarkers(child, values, component),
    );
  }
}

/**
 * 🎯 배열 전용 렌더링 (단순 교체 방식)
 */
function patchArrayContent(parent, anchorNode, arrayData, values, component) {
  const markerId = anchorNode._arrayMarker;

  // 1. 기존 배열 노드들 수집 및 제거
  const nodesToRemove = [];
  let current = anchorNode.nextSibling;

  while (current) {
    if (current.nodeType === Node.COMMENT_NODE) {
      break;
    }
    nodesToRemove.push(current);
    current = current.nextSibling;
  }

  nodesToRemove.forEach((node) => {
    cleanupEventListeners(node);
    node.remove();
  });

  // 2. 새 배열 아이템들 렌더링 및 삽입
  const refNode = anchorNode.nextSibling;

  arrayData.forEach((item) => {
    const rendered = renderValue(item, component);
    parent.insertBefore(rendered, refNode);
  });
}

export function patch(parent, newNode, oldNode, index, values, component) {
  // 🎯 배열 앵커 처리
  if (
    oldNode?.nodeType === Node.COMMENT_NODE &&
    oldNode._arrayMarker !== undefined
  ) {
    const markerId = oldNode._arrayMarker;
    const realValue = values[markerId];

    if (Array.isArray(realValue)) {
      patchArrayContent(parent, oldNode, realValue, values, component);
      return;
    }
  }

  // 1. 삭제
  if (!newNode && oldNode) {
    if (
      oldNode.nodeType === Node.COMMENT_NODE &&
      oldNode._arrayMarker !== undefined
    ) {
      return; // 앵커는 유지
    }
    cleanupEventListeners(oldNode);
    return oldNode.remove();
  }

  let targetNode = oldNode;

  // 2. 생성/교체
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

  // 3. 텍스트 노드
  if (newNode.nodeType === Node.TEXT_NODE) {
    const text = newNode.textContent;
    const match = text.match(/__VAL_(\d+)__/);

    if (match) {
      const markerId = match[1];
      const realValue = values[markerId];

      // 배열: 앵커로 변환
      if (Array.isArray(realValue)) {
        const anchor = createArrayAnchor(markerId);
        parent.replaceChild(anchor, targetNode);

        // 즉시 배열 내용 렌더링
        patchArrayContent(parent, anchor, realValue, values, component);
        return;
      }

      // 중첩 템플릿
      if (realValue && typeof realValue === "object" && realValue.strings) {
        parent.replaceChild(renderValue(realValue, component), targetNode);
        return;
      }

      // 일반 문자열
      const finalValue = text.replace(/__VAL_(\d+)__/g, (_, i) => values[i]);
      if (targetNode.textContent !== finalValue) {
        targetNode.textContent = finalValue;
      }
    }
    return;
  }

  // 4. 엘리먼트 노드
  if (newNode.nodeType === Node.ELEMENT_NODE) {
    updateAttrs(newNode, targetNode, values);
    updateProps(newNode, targetNode, values, component);

    if (
      targetNode.tagName.includes("-") &&
      typeof targetNode.render === "function"
    ) {
      targetNode.render();
    }

    // 자식 패치
    const newChildren = Array.from(newNode.childNodes);
    const oldChildren = Array.from(targetNode.childNodes);
    const max = Math.max(newChildren.length, oldChildren.length);

    for (let i = 0; i < max; i++) {
      patch(targetNode, newChildren[i], oldChildren[i], i, values, component);
    }
  }
}

/**
 * 이벤트 리스너 정리
 */
function cleanupEventListeners(node) {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return;

  Object.keys(node).forEach((key) => {
    if (key.startsWith("_@")) {
      const eventName = key.replace("_@", "");
      node.removeEventListener(eventName, node[key]);
      delete node[key];
    }
  });

  Array.from(node.childNodes).forEach(cleanupEventListeners);
}

export function updateAttrs(blueprint, target, values) {
  const attrs = Array.from(blueprint.attributes || []);

  attrs.forEach(({ name, value }) => {
    if (name.startsWith(":") || name.startsWith("@") || name.startsWith("$"))
      return;

    if (name === "checked" || name === "disabled") {
      target[name] = Boolean(value);
      if (value) target.setAttribute(name, "");
      else target.removeAttribute(name);
      return;
    }

    if (
      name === "value" &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
    ) {
      // 🔍 마커(__VAL_0__)를 실제 values 배열의 값으로 치환하는 로직 추가
      const resolvedValue = value.replace(
        /__VAL_(\d+)__/g,
        (_, i) => values[i],
      );
      target.value = resolvedValue;
      return;
    }

    if (name.startsWith("?")) {
      const realName = name.slice(1);
      const match = value.match(/__VAL_(\d+)__/);

      if (match) {
        const boolValue = !!values[match[1]];
        if (boolValue) {
          target.setAttribute(realName, "");
        } else {
          target.removeAttribute(realName);
        }
      }

      target.removeAttribute(name);
      return;
    }

    const nameMatch = name.match(/^__val_(\d+)__$/i);

    if (nameMatch) {
      const realValue = values[nameMatch[1]];
      if (realValue && typeof realValue === "string") {
        target.setAttribute(realValue, "");
      }
      target.removeAttribute(name);
      return;
    }

    const finalValue = value.replace(/__VAL_(\d+)__/g, (_, i) => values[i]);
    if (target.getAttribute(name) !== finalValue) {
      target.setAttribute(name, finalValue);
    }
  });
}

export function updateProps(blueprint, target, values, component) {
  const attrs = Array.from(blueprint.attributes || []);

  attrs.forEach(({ name, value }) => {
    // 1. 공통 변환 로직: 특수문자($ , : , @) 제거 및 케밥 -> 카멜 변환
    const cleanName = name.replace(/^[$:@]/, "");
    const camelName = cleanName.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );

    // 2. $refs 처리
    if (name.startsWith("$") && component) {
      const existing = component.$refs[camelName];

      if (!existing) {
        component.$refs[camelName] = target;
      } else if (Array.isArray(existing)) {
        if (!existing.includes(target)) existing.push(target);
      } else if (existing !== target) {
        component.$refs[camelName] = [existing, target];
      }

      target.removeAttribute(name);
      return;
    }

    // 3. 이벤트 리스너 (@) 처리
    if (name.startsWith("@")) {
      // 이벤트는 camelName 대신 원본에서 수식어(modifiers)를 분리해야 함
      const [rawEventName, ...modifiers] = name.slice(1).split(".");
      // 이벤트명 자체도 케밥케이스일 수 있으므로 변환 (예: @custom-event -> customEvent)
      const eventName = rawEventName;

      const match = value.match(/__VAL_(\d+)__/);
      const realValue = match ? values[match[1]] : null;

      if (target[`_@${name}_`] !== realValue) {
        if (target[`_@${name}_wrapped`]) {
          target.removeEventListener(eventName, target[`_@${name}_wrapped`]);
        }

        const eventHandler = (e) => {
          if (modifiers.includes("prevent")) e.preventDefault();
          if (modifiers.includes("stop")) e.stopPropagation();
          if (modifiers.includes("self") && e.target !== e.currentTarget)
            return;

          if (typeof realValue === "function") {
            return realValue.call(component, e);
          }
        };

        target.addEventListener(eventName, eventHandler, {
          once: modifiers.includes("once"),
          capture: modifiers.includes("capture"),
        });
        target[`_@${name}_`] = realValue;
        target[`_@${name}_wrapped`] = eventHandler;
      }

      target.removeAttribute(name);
      return;
    }

    // 4. 프로퍼티 바인딩 (:) 처리
    if (name.startsWith(":")) {
      const match = value.match(/__VAL_(\d+)__/);
      if (match) {
        const realValue = values[match[1]];
        if (target[camelName] !== realValue) {
          target[camelName] = realValue;
        }
        target.removeAttribute(name);
      }
    }
  });
}
