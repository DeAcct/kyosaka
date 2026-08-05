//lib/diff.js
import { BlockInstance } from './block';

/**
 * 🔥 배열 렌더링 추적 시스템
 */

// 배열 앵커 생성
function createArrayAnchor(markerId, type = "start") {
  const comment = document.createComment(`array-${type}-${markerId}`);
  comment._arrayMarker = markerId;
  comment._arrayAnchorType = type; // 'start' 또는 'end'
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
    const markerRegex = /(__VAL_\d+__)/g;

    if (markerRegex.test(text)) {
      const parent = node.parentNode;
      const parts = text.split(markerRegex);

      parts.forEach((part) => {
        if (!part) return;

        const match = part.match(/__VAL_(\d+)__/);
        if (match) {
          const markerId = match[1];
          const realValue = values[markerId];
          const rendered = renderValue(realValue, component);

          if (Array.isArray(realValue)) {
            // 🎯 시작 앵커와 끝 앵커 쌍을 배치하여 경계선 확립
            const startAnchor = createArrayAnchor(markerId, "start");
            const endAnchor = createArrayAnchor(markerId, "end");
            parent.insertBefore(startAnchor, node);
            parent.insertBefore(rendered, node);
            parent.insertBefore(endAnchor, node);
          } else {
            parent.insertBefore(rendered, node);
          }
        } else {
          parent.insertBefore(document.createTextNode(part), node);
        }
      });

      node.remove();
      return;
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    updateAttrs(node, node, values);
    updateProps(node, node, values, component);
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

  // --- 🎯 Block Virtual DOM 초고속 업데이트 경로 ---
  const isBlockArray = arrayData.length > 0 && arrayData.every(item => item && item._isBlockData);
  const wasBlockArray = !!anchorNode._blockInstances;

  if (isBlockArray || wasBlockArray) {
    const instances = anchorNode._blockInstances || [];
    const newInstances = [];
    let isCurrentlyBlockArray = isBlockArray;
    
    // 만약 현재 빈 배열이거나 일반 배열로 전환되었다면 blockInstances를 비워야 함
    if (!isBlockArray && arrayData.length > 0) {
       // 블록 배열에서 일반 배열로 전환된 특이 케이스 -> 인스턴스 전부 제거 후 일반 로직으로 폴백
       instances.forEach(inst => inst.remove());
       anchorNode._blockInstances = null;
    } else {
       const maxLength = Math.max(instances.length, arrayData.length);
       let currentDOMAnchor = anchorNode.nextSibling;
       
       for (let i = 0; i < maxLength; i++) {
          const oldInst = instances[i];
          const newBlockData = arrayData[i];
          
          if (oldInst && newBlockData) {
             if (oldInst.def === newBlockData.def) {
                // 구조가 같다면 diff 생략하고 O(1) 값만 교체
                oldInst.patch(newBlockData.values);
                newInstances.push(oldInst);
                currentDOMAnchor = oldInst.rootNodes[oldInst.rootNodes.length - 1].nextSibling;
             } else {
                // 다른 형태의 블록일 경우 교체
                const newInst = new BlockInstance(newBlockData.def, newBlockData.values, component);
                oldInst.remove();
                newInst.insertBefore(parent, currentDOMAnchor);
                newInstances.push(newInst);
             }
          } else if (!oldInst && newBlockData) {
             const newInst = new BlockInstance(newBlockData.def, newBlockData.values, component);
             newInst.insertBefore(parent, currentDOMAnchor);
             newInstances.push(newInst);
          } else if (oldInst && !newBlockData) {
             oldInst.remove();
          }
       }
       
       anchorNode._blockInstances = newInstances;
       if (isBlockArray || arrayData.length === 0) return; // 성공적으로 블록 처리 완료
    }
  }

  // --- 기존 범용 DOM Diffing 경로 ---

  const oldNodes = [];
  let current = anchorNode.nextSibling;

  // 🎯 자신의 고유 end 앵커를 만날 때까지만 수집 (다른 형제 노드 침범 방지)
  while (current) {
    if (
      current.nodeType === Node.COMMENT_NODE &&
      current._arrayMarker === markerId &&
      current._arrayAnchorType === "end"
    ) {
      break;
    }
    oldNodes.push(current);
    current = current.nextSibling;
  }

  const endAnchor = current;

  // 기존 범용 DOM Diffing 경로에서는 속성/프로퍼티 갱신이 불가능하므로 (values 컨텍스트 분리),
  // 기존 노드를 모두 삭제하고 새로 렌더링된 노드를 삽입합니다.
  oldNodes.forEach(node => {
    cleanupEventListeners(node);
    node.remove();
  });

  arrayData.forEach((item) => {
    const rendered = renderValue(item, component);
    parent.insertBefore(rendered, endAnchor);
  });
}

// lib/diff.js

export function patch(parent, newNode, oldNode, index, values, component) {
  // 🎯 오직 start 앵커일 때만 배열 패치 진입
  if (
    oldNode?.nodeType === Node.COMMENT_NODE &&
    oldNode._arrayMarker !== undefined &&
    oldNode._arrayAnchorType === "start"
  ) {
    const markerId = oldNode._arrayMarker;
    const realValue = values[markerId];

    if (Array.isArray(realValue)) {
      patchArrayContent(parent, oldNode, realValue, values, component);
      return;
    }
  }

  if (!newNode && oldNode) {
    if (
      oldNode.nodeType === Node.COMMENT_NODE &&
      oldNode._arrayMarker !== undefined
    ) {
      return; // 앵커 유지
    }
    cleanupEventListeners(oldNode);
    return oldNode.remove();
  }

  let targetNode = oldNode;

  // ----------------------------------------------------------------
  // 🎯 [교정 구간]: 노드 신규 생성 및 교체 아키텍처 순서 재정렬
  // ----------------------------------------------------------------
  if (
    !oldNode ||
    newNode.nodeType !== oldNode.nodeType ||
    newNode.nodeName !== oldNode.nodeName
  ) {
    if (oldNode) cleanupEventListeners(oldNode);
    targetNode = newNode.cloneNode(true);

    // 🔥 [핵심]: appendChild / replaceChild로 실DOM에 꽂기 "전에"
    // 속성과 프로퍼티(:type 등)를 컴포넌트 인스턴스에 동기식으로 먼저 주입합니다.
    if (newNode.nodeType === Node.ELEMENT_NODE) {
      updateAttrs(newNode, targetNode, values);
      updateProps(newNode, targetNode, values, component);
    }

    // 데이터가 이미 완벽하게 안착된 상태에서 DOM에 바인딩되므로,
    // 이 직후 터지는 connectedCallback() -> template() 내부에서 this.type을 정상 인식합니다.
    if (!oldNode) parent.appendChild(targetNode);
    else parent.replaceChild(targetNode, oldNode);
  }

  if (newNode.nodeType === Node.TEXT_NODE) {
    const text = newNode.textContent;
    const match = text.match(/__VAL_(\d+)__/);

    if (match) {
      const markerId = match[1];
      const realValue = values[markerId];

      if (Array.isArray(realValue)) {
        const startAnchor = createArrayAnchor(markerId, "start");
        const endAnchor = createArrayAnchor(markerId, "end");
        parent.replaceChild(startAnchor, targetNode);
        parent.insertBefore(endAnchor, startAnchor.nextSibling);

        patchArrayContent(parent, startAnchor, realValue, values, component);
        return;
      }

      if (realValue && typeof realValue === "object" && realValue.strings) {
        parent.replaceChild(renderValue(realValue, component), targetNode);
        return;
      }

      const finalValue = text.replace(/__VAL_(\d+)__/g, (_, i) => values[i]);
      if (targetNode.textContent !== finalValue) {
        targetNode.textContent = finalValue;
      }
    }
    return;
  }

  if (newNode.nodeType === Node.ELEMENT_NODE) {
    // 💡 아래 기존 패치 로직들은 '업데이트(기존 노드 변경)' 파이프라인을 위해 그대로 유지합니다.
    // (새로 생성된 노드의 경우 위에서 이미 값이 주입되었으므로 내부 중복 방어 조건에 의해 자연스럽게 1회만 평가됩니다.)
    updateAttrs(newNode, targetNode, values);
    updateProps(newNode, targetNode, values, component);

    if (
      targetNode.tagName.includes("-") &&
      typeof targetNode.render === "function"
    ) {
      targetNode.render();
    }

    const newChildren = Array.from(newNode.childNodes);
    let currentOldChild = targetNode.firstChild;

    newChildren.forEach((newChild) => {
      const oldChild = currentOldChild;

      if (
        oldChild &&
        oldChild.nodeType === Node.COMMENT_NODE &&
        oldChild._arrayMarker !== undefined &&
        oldChild._arrayAnchorType === "start"
      ) {
        let current = oldChild.nextSibling;
        while (current) {
          if (
            current.nodeType === Node.COMMENT_NODE &&
            current._arrayMarker === oldChild._arrayMarker &&
            current._arrayAnchorType === "end"
          ) {
            current = current.nextSibling;
            break;
          }
          current = current.nextSibling;
        }
        currentOldChild = current;
      } else {
        currentOldChild = oldChild ? oldChild.nextSibling : null;
      }

      patch(targetNode, newChild, oldChild, 0, values, component);
    });

    while (currentOldChild) {
      const next = currentOldChild.nextSibling;
      patch(targetNode, null, currentOldChild, 0, values, component);
      currentOldChild = next;
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
      if (target.value !== resolvedValue) {
        target.value = resolvedValue;
      }
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
  let isPropsChanged = false; // 🎯 1. 변경 여부를 추적할 독립 플래그 생성

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
          if (e instanceof KeyboardEvent) {
            const keyMap = {
              enter: "Enter",
              escape: "Escape",
              space: [" ", "Spacebar"],
              up: "ArrowUp",
              down: "ArrowDown",
              left: "ArrowLeft",
              right: "ArrowRight",
            };
            
            // 키(key) 관련 수식어가 포함되어 있는지 확인
            const activeKeyModifiers = modifiers.filter(m => keyMap[m] !== undefined);
            if (activeKeyModifiers.length > 0) {
              const isMatch = activeKeyModifiers.some(m => {
                const targetKey = keyMap[m];
                if (Array.isArray(targetKey)) return targetKey.includes(e.key);
                return e.key === targetKey;
              });
              if (!isMatch) return; // 누른 키가 수식어에 명시된 키와 다르면 실행 취소
            }

            // 시스템 키(ctrl, shift, alt, meta) 수식어 확인
            if (modifiers.includes("ctrl") && !e.ctrlKey) return;
            if (modifiers.includes("shift") && !e.shiftKey) return;
            if (modifiers.includes("alt") && !e.altKey) return;
            if (modifiers.includes("meta") && !e.metaKey) return;
          }

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
          isPropsChanged = true;
        }
        target.removeAttribute(name);
      }
    }
  });
  if (isPropsChanged && typeof target.onPropsPatchComplete === "function") {
    target.onPropsPatchComplete();
  }
}
