---
name: my-skill
description: 이 스킬이 무엇을 하고 언제 사용하는지. Claude는 이를 읽어 관련성을 판단합니다. 사용자가 자연스럽게 말할 키워드를 포함하세요.
---

이 두 필드만 필수입니다. `name`은 소문자와 하이픈, 최대 64자이며 부모 디렉토리 이름과 일치해야 합니다. `description`은 Claude가 시작 시 스킬의 관련성을 판단하기 위해 읽는 설명입니다 (최대 1024자).

## 선택적 Frontmatter 필드

위의 `---` 블록에 다음을 추가하여 동작을 커스터마이징하세요:

| 필드 | 예시 | 목적 |
|---|---|---|
| `argument-hint` | `[issue-number]` | 자동완성 시 예상 인자를 나타내는 힌트 |
| `disable-model-invocation` | `true` | Claude의 자동 로딩을 방지. 사용자가 `/name`을 명시적으로 입력해야 함. 배포, 전송, 파괴적 작업에 사용 |
| `user-invocable` | `false` | `/` 메뉴에서 숨김. Claude는 여전히 자동으로 로드 가능. 백그라운드 지식에 사용 |
| `allowed-tools` | `Read, Grep, Bash(npm *)` | Claude가 권한 요청 없이 사용할 수 있는 도구. 공백으로 구분, 패턴 지원 |
| `model` | `claude-sonnet-4-6` | 이 스킬이 활성화될 때 모델 오버라이드. 비용 제어에 유용 |
| `context` | `fork` | [격리된 서브에이전트](^자체 컨텍스트를 가진 별도의 Claude 인스턴스. 스킬 내용이 서브에이전트의 시스템 프롬프트가 됩니다)에서 실행. 스킬 내용이 서브에이전트의 프롬프트가 됨 |
| `agent` | `Explore` | `context: fork`일 때 실행되는 서브에이전트. 내장: `Explore`, `Plan`, `general-purpose`, 또는 `.claude/agents/`의 커스텀 |
| `license` | `Apache-2.0` | 라이선스 이름 또는 번들된 LICENSE 파일 참조 |
| `compatibility` | `Requires git, docker` | 환경 요구사항 (최대 500자) |
| `metadata` | 키-값 쌍 | 임의의 메타데이터 (작성자, 버전 등) |

---

# 본문 내용

frontmatter 아래의 모든 것이 지시사항 본문입니다. Claude는 스킬이 활성화될 때 이를 읽습니다. Claude가 작업을 수행하는 데 도움이 되는 것이면 무엇이든 작성하세요. 형식 제한은 없습니다.

좋은 본문 내용:

- 작업을 위한 단계별 지시사항
- 입력과 예상 출력의 예시
- 일반적인 엣지 케이스와 처리 방법
- 이 스킬 폴더의 지원 파일 참조

## 문자열 치환

[플레이스홀더](^SKILL.md에서 Claude가 내용을 보기 전에 실제 값으로 대체되는 변수)는 Claude가 내용을 보기 전에 실제 값으로 대체됩니다:

| 플레이스홀더 | 해석 결과 |
|---|---|
| `$ARGUMENTS` | 사용자가 스킬 이름 뒤에 입력한 모든 것 |
| `$ARGUMENTS[N]` 또는 `$N` | 인덱스별 특정 인자 (0부터 시작) |
| `${CLAUDE_SESSION_ID}` | 현재 세션 ID |
| `${CLAUDE_SKILL_DIR}` | 이 스킬 디렉토리의 경로 |

예: `/my-skill SearchBar React Vue`는 `$0` = "SearchBar", `$1` = "React", `$2` = "Vue"를 제공합니다.

`$ARGUMENTS`가 내용에 없으면 인자가 `ARGUMENTS: <value>`로 추가됩니다.

## 동적 컨텍스트 주입

`!` 백틱 구문은 내용이 Claude에 도달하기 전에 셸 명령어를 실행합니다. 출력이 플레이스홀더를 대체합니다:

- PR 차이점: `` !`gh pr diff` ``
- 의존성: `` !`cat package.json | jq .dependencies` ``
- 변경된 파일: `` !`git diff --name-only` ``

이것은 [전처리](^명령어는 대화 중이 아닌 스킬 로드 시에 실행됩니다. Claude는 명령어가 아닌 최종 출력만 봅니다)입니다. Claude는 명령어가 아닌 최종 출력만 봅니다.

---

# 지원 파일

SKILL.md는 500줄 이하로 유지하세요. 상세 자료는 별도 파일로 이동하고 본문에서 참조하세요:

- [references/REFERENCE.md](references/REFERENCE.md): 필요 시 로드되는 상세 문서
- [assets/template.md](assets/template.md): 템플릿과 정적 리소스
- [scripts/helper.sh](scripts/helper.sh): Claude가 실행할 수 있는 실행 가능 코드

SKILL.md에서 상대 경로를 사용하세요. 참조는 한 단계 깊이로 유지하세요. 각 폴더에 대해 자세히 알아보려면 해당 폴더로 이동하세요.