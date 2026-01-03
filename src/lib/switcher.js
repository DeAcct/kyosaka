// T는 전체 유니온 타입, R은 반환 타입
/**
 * 복잡한 조건에 따라 분기 처리를 수행하고 결과값을 반환하는 함수형 유틸리티입니다.
 * * 순수 switch문이나 if-else 체인과 달리, '표현식'으로 동작하여 최종 값을 바로 반환할 수 있습니다.
 * * 각 조건(case)은 boolean을 반환하는 predicate 함수로 정의됩니다.
 * * 단순 값 비교를 넘어 연립부등식과 같은 복잡한 비즈니스 로직을 명료하게 표현할 수 있습니다.
 * const getCharacterState = (hp, stamina) =>
 * switcher({ hp, stamina })
 * .case(stats => stats.hp < 20 && stats.stamina < 10, '위험')
 * .case(stats => stats.stamina < 30, '지침')
 * .default('안정');
 * const myState = getCharacterState(80, 25); // '지침'
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

    default(fallbackOrValue) {
      const match = cases.find(({ predicate }) => predicate(value));
      return (match?.action ?? toFn(fallbackOrValue))(value);
    },
  };

  return chain;
};
