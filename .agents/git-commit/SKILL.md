# SKILL.md

## Description
staged 상태의 변경 사항을 분석하여 Conventional Commits 표준(feat, fix, docs, refactor 등)에 맞는 명확한 커밋 메시지를 작성하고 자동으로 커밋을 실행합니다.

## When to Use
- 사용자가 "커밋해줘", "코드 저장해줘", "git commit"과 같은 요청을 할 때.
- 코드 작성 작업 완료 후 저장소 상태를 업데이트해야 할 때.

## Instructions
1. 현재 어떤 파일이 변경되었는지 `git status`와 `git diff --cached`를 통해 파악하세요.
2. 만약 스테이징된 파일이 없다면, 사용자에게 묻지 말고 수정된 파일들을 `git add`로 먼저 스테이징하세요.
3. 커밋 메시지는 반드시 다음 **Conventional Commits** 규격을 따르세요:
   - 형식: `<type>(<scope>): <subject>` (예: `feat(auth): add google login button`)
   - `<subject>`는 명령조, 현재 시제로 작성하며 첫 글자는 대문자로 시작하고 끝에 마침표를 찍지 않습니다.
4. 분석한 메시지를 바탕으로 `git commit -m "<message>"` 명령어를 터미널에서 즉시 실행하세요.
5. 커밋이 완료되면 변경 내역과 커밋 메시지를 사용자에게 요약 브리핑하세요.