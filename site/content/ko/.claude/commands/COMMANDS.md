# 커스텀 슬래시 커맨드 (Deprecated)

재사용 가능한 `/slash-commands`를 만드는 마크다운 파일입니다. 커맨드는 [스킬로 통합](^커맨드와 스킬은 이제 같은 시스템입니다. .claude/commands/review.md의 커맨드 파일과 .claude/skills/review/SKILL.md의 스킬은 모두 /review를 생성하며 동일하게 작동합니다)되었지만, 기존 커맨드 파일은 여전히 작동하며 이 디렉토리도 계속 지원됩니다.

## 빠른 시작

1. `.claude/commands/`에 `.md` 파일을 만드세요
2. 내부에 프롬프트를 작성하세요. `$ARGUMENTS`를 사용자 입력의 플레이스홀더로 사용합니다
3. 파일 이름이 커맨드 이름이 됩니다: `review-pr.md`는 `/review-pr`을 생성합니다
4. Claude Code에서 `/`를 입력하면 커맨드를 보고 실행할 수 있습니다

## 작동 방식

1. Claude는 시작 시 `.claude/commands/`를 스캔하고 각 `.md` 파일을 슬래시 커맨드로 등록합니다
2. `/command-name`을 호출하면 Claude가 파일을 읽고 `$ARGUMENTS`를 커맨드 뒤에 입력한 내용으로 대체합니다
3. 확장된 프롬프트가 사용자가 직접 입력한 것처럼 Claude에 전달됩니다

## 커맨드 vs 스킬

커맨드는 더 단순한 원래 시스템입니다. 스킬은 더 새롭고 강력한 대체 시스템입니다.

| | 커맨드 | 스킬 |
|---|---|---|
| 파일 위치 | `.claude/commands/name.md` | `.claude/skills/name/SKILL.md` |
| 호출 방식 | `/name`만 가능 | `/name` 또는 자동 로드 |
| 인자 | `$ARGUMENTS`만 가능 | `$ARGUMENTS`, `$N`, 환경 변수 |
| Frontmatter | 미지원 | 전체 frontmatter (모델, 도구, 호출 제어) |
| 지원 파일 | 없음 | scripts/, references/, assets/ |
| 동적 컨텍스트 | 미지원 | `!`backtick`` 셸 주입 |

새로 시작한다면 스킬을 사용하세요. 기존 커맨드가 있다면 변경 없이 계속 작동합니다.

## 커맨드 위치

| 위치 | 경로 | 범위 |
|---|---|---|
| 프로젝트 | `.claude/commands/` | 팀과 공유 (커밋됨) |
| 개인 | `~/.claude/commands/` | 모든 개인 프로젝트 (커밋 안 됨) |

## 스킬로 마이그레이션

커맨드를 스킬로 변환하려면:

1. `.claude/skills/command-name/SKILL.md`를 생성합니다
2. `name`과 `description`이 포함된 frontmatter를 추가합니다
3. 프롬프트를 본문으로 이동합니다
4. 원래 커맨드 파일을 삭제합니다

`/command-name` 호출 방식은 동일하게 유지됩니다. frontmatter 제어, 지원 파일, 자동 로딩 기능을 추가로 얻을 수 있습니다.

## 팁

- 커맨드는 하나의 작업에 집중하세요
- 프롬프트에 프로젝트별 컨텍스트(컨벤션, 패턴)를 포함하세요
- `$ARGUMENTS`를 사용하여 커맨드를 유연하게 만드세요: `/review-pr focus on auth changes`
- 같은 이름의 커맨드와 스킬은 충돌합니다. 둘 중 하나만 사용하세요

## 스캐폴딩 살펴보기

아래의 `my-command/` 폴더를 열어 모든 섹션이 설명된 커맨드 파일의 구조를 확인하세요.