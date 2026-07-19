//lib/block.js
import { updateAttrs, updateProps } from './diff';

const blockCache = new Map();

export function compileBlock(strings) {
  const htmlStr = strings.reduce(
    (acc, str, i) => acc + str + (i < strings.length - 1 ? `__VAL_${i}__` : ""),
    ""
  );
  const temp = document.createElement("template");
  temp.innerHTML = htmlStr;

  // 1. 텍스트 노드 격리 (마커만 존재하는 단독 텍스트 노드로 분리)
  const walker = document.createTreeWalker(temp.content, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach(node => {
    const text = node.textContent;
    const markerRegex = /(__VAL_\d+__)/g;
    if (markerRegex.test(text)) {
      const parent = node.parentNode;
      const parts = text.split(markerRegex);
      parts.forEach(part => {
        if (!part) return;
        parent.insertBefore(document.createTextNode(part), node);
      });
      parent.removeChild(node);
    }
  });

  // 2. 동적 노드 탐색 및 경로 캐싱
  const dynamicNodes = []; // { path, isText, valIndex, blueprintNode }
  
  function findDynamic(node, path) {
    let hasDynamicAttr = false;
    if (node.nodeType === Node.ELEMENT_NODE) {
      const attrs = Array.from(node.attributes);
      for (const attr of attrs) {
        if (attr.value.includes("__VAL_")) {
          hasDynamicAttr = true;
          break;
        }
      }
      if (hasDynamicAttr) {
        dynamicNodes.push({
          path: [...path],
          isText: false,
          blueprintNode: node
        });
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const match = node.textContent.match(/^__VAL_(\d+)__$/);
      if (match) {
        dynamicNodes.push({
          path: [...path],
          isText: true,
          valIndex: parseInt(match[1], 10)
        });
        node.textContent = ""; // 런타임 클론 시 빈 텍스트로 시작
      }
    }
    
    let child = node.firstChild;
    let index = 0;
    while(child) {
      findDynamic(child, [...path, index]);
      child = child.nextSibling;
      index++;
    }
  }

  findDynamic(temp.content, []);

  return { template: temp, dynamicNodes };
}

export class BlockInstance {
  constructor(def, values, component) {
    this.def = def;
    this.values = values;
    this.component = component;
    
    // 템플릿 복제 (가상 DOM 생성 및 순회 비용 0)
    this.fragment = def.template.content.cloneNode(true);
    
    // 복제된 DOM에서 동적 업데이트할 타겟 노드들의 직접 참조 캐싱
    this.editNodes = def.dynamicNodes.map(dyn => {
      let current = this.fragment;
      for (let i = 0; i < dyn.path.length; i++) {
        current = current.childNodes[dyn.path[i]];
      }
      return { dyn, node: current };
    });

    this.rootNodes = Array.from(this.fragment.childNodes);

    // 초기 마운트 시 속성/텍스트 주입
    this.patch(values, true);
  }

  patch(newValues, isInitial = false) {
    this.values = newValues;
    this.editNodes.forEach(({ dyn, node }) => {
      if (dyn.isText) {
        const val = newValues[dyn.valIndex];
        const strVal = val === undefined || val === null ? "" : String(val);
        if (isInitial || node.textContent !== strVal) {
           node.textContent = strVal;
        }
      } else {
        // 복합 속성 업데이트 (diff.js의 기존 헬퍼 재사용)
        updateAttrs(dyn.blueprintNode, node, newValues);
        updateProps(dyn.blueprintNode, node, newValues, this.component);
      }
    });
  }

  insertBefore(parent, anchor) {
    this.rootNodes.forEach(n => parent.insertBefore(n, anchor));
  }
  
  remove() {
    this.rootNodes.forEach(n => n.remove());
  }
}

/**
 * 렌더 함수를 Block Virtual DOM 인스턴스로 변환하는 HOC
 */
export function block(renderFn) {
  return (props) => {
    const templateResult = renderFn(props);
    if (!templateResult || !templateResult.strings) {
      return templateResult;
    }

    const { strings, values } = templateResult;
    let def = blockCache.get(strings);

    if (!def) {
      def = compileBlock(strings);
      blockCache.set(strings, def);
    }

    return {
      _isBlockData: true,
      def,
      values,
    };
  };
}
