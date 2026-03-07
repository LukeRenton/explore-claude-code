# 플러그인

플러그인은 스킬, 에이전트, 훅, MCP 서버를 공유 가능한 확장으로 패키징합니다. 플러그인은 `.claude-plugin/plugin.json` 매니페스트와 하나 이상의 컴포넌트가 있는 디렉토리입니다.

## 빠른 시작

1. 플러그인용 디렉토리를 만드세요: `mkdir my-plugin`
2. 매니페스트를 추가하세요: `my-plugin/.claude-plugin/plugin.json`
3. 플러그인 루트에 컴포넌트(스킬, 에이전트, 훅, MCP 서버)를 추가하세요
4. 로컬에서 테스트하세요: `claude --plugin-dir ./my-plugin`

## 플러그인을 사용할 때

| 접근법 | 스킬 이름 | 적합한 용도 |
|---|---|---|
| **독립형** (`.claude/` 디렉토리) | `/hello` | 개인 워크플로우, 프로젝트별 커스터마이징, 빠른 실험 |
| **플러그인** (`.claude-plugin/plugin.json`) | `/plugin-name:hello` | 팀원과 공유, 커뮤니티 배포, 버전 관리된 릴리스 |

빠른 반복을 위해 독립형 설정으로 시작하고, 공유할 준비가 되면 플러그인으로 변환하세요.

## 플러그인 구조

```
my-plugin/
  .claude-plugin/
    plugin.json          # 매니페스트 (필수)
  skills/                # SKILL.md 파일이 있는 Agent Skills
  commands/              # 마크다운 파일 형태의 스킬
  agents/                # 커스텀 에이전트 정의
  hooks/                 # hooks.json의 이벤트 핸들러
  .mcp.json              # MCP 서버 설정
  .lsp.json              # LSP 서버 설정
  settings.json          # 플러그인 활성화 시 기본 설정
```

`plugin.json`만 `.claude-plugin/` 안에 들어갑니다. 다른 모든 디렉토리는 플러그인 루트에 위치합니다.

## 플러그인 매니페스트

`plugin.json` 파일은 플러그인의 정체성을 정의합니다:

```json
{
  "name": "my-plugin",
  "description": "이 플러그인이 하는 일",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

| 필드 | 목적 |
|---|---|
| `name` | 고유 식별자이자 스킬 네임스페이스. 스킬에 이 접두사가 붙습니다 (예: `/my-plugin:hello`) |
| `description` | 플러그인 관리자에서 탐색하거나 설치할 때 표시됩니다 |
| `version` | [시맨틱 버전관리](^1.2.3 같은 Major.minor.patch 형식. Major = 호환성 깨지는 변경, minor = 새 기능, patch = 버그 수정)를 사용하여 릴리스를 추적합니다 |
| `author` | 선택 사항. 기여자 표시에 유용합니다 |

추가 선택 필드: `homepage`, `repository`, `license`, `keywords`.

## 네임스페이싱

플러그인 스킬은 충돌을 방지하기 위해 항상 네임스페이싱됩니다. `code-tools` 플러그인의 `review` 스킬은 `/code-tools:review`가 됩니다. 네임스페이스 접두사를 변경하려면 `plugin.json`의 `name` 필드를 수정하세요.

## 컴포넌트 추가

### 스킬

`SKILL.md` 파일이 있는 스킬 폴더를 포함하는 `skills/` 디렉토리를 추가하세요. 각 스킬에는 `name`과 `description`이 있는 frontmatter가 필요합니다:

```yaml
---
name: code-review
description: 코드를 모범 사례와 잠재적 이슈에 대해 리뷰합니다
---

코드를 리뷰할 때 다음을 확인하세요:
1. 코드 구성과 구조
2. 에러 처리
3. 보안 우려 사항
```

### LSP 서버

공식 플러그인에서 아직 다루지 않는 언어에 대해 실시간 코드 인텔리전스를 제공하려면 `.lsp.json` 파일을 추가하세요:

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": { ".go": "go" }
  }
}
```

### 기본 설정

플러그인 활성화 시 설정을 적용하려면 `settings.json`을 포함하세요. 현재 커스텀 에이전트를 메인 스레드로 활성화하는 `agent` 키를 지원합니다:

```json
{
  "agent": "security-reviewer"
}
```

## 로컬 테스트

개발 중에는 `--plugin-dir` 플래그를 사용하세요:

```bash
claude --plugin-dir ./my-plugin
```

여러 플러그인을 한 번에 로드하세요:

```bash
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```

각 컴포넌트를 테스트하세요: `/plugin-name:skill-name`으로 스킬을 실행하고, `/agents`로 에이전트를 확인하고, 훅이 올바르게 트리거되는지 검증하세요.

## 독립형에서 변환

이미 `.claude/`에 스킬이나 훅이 있다면 플러그인으로 변환하세요:

1. `.claude-plugin/plugin.json`이 있는 플러그인 디렉토리를 생성합니다
2. 기존 `commands/`, `agents/`, `skills/` 디렉토리를 복사합니다
3. `settings.json`의 훅을 `hooks/hooks.json`으로 이동합니다
4. `--plugin-dir`로 테스트합니다

| 독립형 (`.claude/`) | 플러그인 |
|---|---|
| 한 프로젝트에서만 사용 가능 | 마켓플레이스를 통해 공유 가능 |
| `.claude/commands/`의 파일 | `plugin-name/commands/`의 파일 |
| `settings.json`의 훅 | `hooks/hooks.json`의 훅 |
| 공유하려면 수동 복사 필요 | `/plugin install`로 설치 |

## 플러그인 공유

플러그인이 준비되면:

1. 설치 및 사용 방법이 포함된 `README.md`를 추가합니다
2. 시맨틱 버전관리로 플러그인 버전을 관리합니다
3. [마켓플레이스](^플러그인 목록과 가져올 위치를 나열하는 카탈로그. MARKETPLACES.md를 참조하세요)를 통해 배포하거나 저장소를 직접 공유합니다
4. [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit)을 통해 공식 Anthropic 마켓플레이스에 제출합니다

## 팁

- `claude plugin validate .` 또는 `/plugin validate .`를 사용하여 플러그인 이슈를 확인하세요
- 훅 명령어와 MCP 설정에서 `${CLAUDE_PLUGIN_ROOT}`를 사용하여 플러그인 설치 디렉토리 내의 파일을 참조하세요
- 플러그인은 설치 시 캐시에 복사됩니다. 플러그인 디렉토리 외부의 파일은 사용할 수 없습니다 - 필요하면 심볼릭 링크를 사용하세요
- 변경 사항을 반영하려면 Claude Code를 재시작하세요
- 스킬은 500줄 이하로 유지하세요. 상세 자료는 `references/` 또는 `assets/` 하위 디렉토리로 이동하세요

## 추가 자료
- [플러그인 문서](https://code.claude.com/docs/en/plugins)
- [플러그인 레퍼런스](https://code.claude.com/docs/en/plugins-reference)