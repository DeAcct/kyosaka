/**
 * 복잡한 조건에 따라 분기 처리를 수행하고 결과값을 반환하는 함수형 유틸리티입니다.
 * * 순수 switch문이나 if-else 체인과 달리, '표현식'으로 동작하여 최종 값을 바로 반환할 수 있습니다.
 * * 각 조건(case)은 boolean을 반환하는 predicate 함수로 정의됩니다.
 * * 단순비교 로직에는 사용하지 마세요. 연립부등식과 같은 복잡한 비즈니스 로직에 사용할 것을 권장합니다.
 * @example
 * ```js
 * const getCharacterState = (hp, stamina) =>
 * switcher({ hp, stamina })
 *  .case(stats => stats.hp < 20 && stats.stamina < 10, '위험')
 *  .case(stats => stats.stamina < 30, '지침')
 *  .default('안정');
 * const myState = getCharacterState(80, 25); // '지침'
 * ```
 */
export const switcher = (value) => {
  const toFn = (maybeFn) =>
    typeof maybeFn === "function" ? maybeFn : () => maybeFn;

  const cases = [];

  const chain = {
    case(predicate, actionOrValue) {
      cases.push({
        predicate,
        action: toFn(actionOrValue),
      });
      return chain;
    },

    anyCase(values, actionOrValue) {
      return chain.case((v) => values.includes(v), actionOrValue);
    },

    match(expected, actionOrValue) {
      return chain.case((v) => v === expected, actionOrValue);
    },

    exec(fallbackOrValue) {
      const match = cases.find(({ predicate }) => predicate(value));
      return (match?.action ?? toFn(fallbackOrValue))(value);
    },

    default(fallbackOrValue) {
      return chain.exec(fallbackOrValue);
    },
  };

  return chain;
};
