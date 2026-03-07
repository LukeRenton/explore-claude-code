---
name: my-agent
description: "Claude가 이 에이전트에 위임해야 할 시점을 설명하세요. 구체적으로 작성하세요. 요청 없이도 Claude가 사용하길 원하면 'use proactively'를 포함하세요."
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a [역할 설명]. When invoked, [수행할 작업].

Your focus areas:
- [주요 책임]
- [부차적 책임]
- [절대 하지 말아야 할 것]

Process:
1. [첫 번째 단계]
2. [두 번째 단계]
3. [최종 단계]

Output format:
- [응답 구조화 방법]

---

이것은 스타터 에이전트 파일입니다. 파일 이름 `my-agent.md`는 이것을 `my-agent`라는 서브에이전트로 등록합니다.

두 번째 `---` 위의 모든 내용은 에이전트의 시스템 프롬프트입니다. 에이전트가 보는 것은 이것뿐입니다(작업 디렉토리 같은 기본 환경 정보 제외). 전체 Claude Code 시스템 프롬프트를 받지 않습니다.

## 이 파일의 구조

**frontmatter** (첫 번째 `---` 쌍 사이)는 에이전트를 설정합니다:

- `name`: 고유 식별자, 소문자와 하이픈. 에이전트를 참조하는 이름입니다
- `description`: Claude가 언제 위임할지 결정하기 위해 읽는 설명. 이 에이전트가 처리하는 작업을 구체적으로 작성하세요
- `tools`: 에이전트가 사용할 수 있는 도구. 생략하면 메인 대화의 모든 도구를 상속합니다. 일반적인 구성:
  - 읽기 전용: `Read, Grep, Glob`
  - 파일 수정 가능: `Read, Grep, Glob, Edit, Write, Bash`
  - 에이전트 생성 가능: `Agent(worker, researcher), Read, Bash`
- `model`: 사용할 모델. `sonnet`은 속도와 능력의 균형, `haiku`는 빠르고 저렴, `opus`는 가장 강력, `inherit`는 메인 대화의 모델을 사용

**본문** (frontmatter 다음)은 시스템 프롬프트입니다. 에이전트에 대한 직접적인 지시로 작성하세요: "You are a...", "When invoked...", "Focus on...".

## 선택적 Frontmatter 필드

```yaml
permissionMode: default      # default | acceptEdits | dontAsk | bypassPermissions | plan
maxTurns: 25                 # 이 횟수의 에이전트 턴 후 중지
background: false            # true이면 항상 백그라운드에서 실행
isolation: worktree          # 임시 git worktree에서 실행
memory: user                 # user | project | local (영구 메모리 활성화)
skills:                      # 시작 시 컨텍스트에 주입할 스킬
  - api-conventions
  - error-handling
mcpServers:                  # 이 에이전트에서 사용 가능한 MCP 서버
  - slack
hooks:                       # 이 에이전트에 범위가 지정된 생명주기 훅
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
```

## 좋은 에이전트의 조건

- 좁고 잘 정의된 책임 ("모든 것을 하는" 것이 아닌)
- Claude가 적절한 작업을 위임하도록 상세한 `description`
- 실제로 필요한 도구만 (최소 권한)
- 결과가 일관되도록 명확한 출력 형식 지시
- 작업을 안내하는 프로세스 단계

## 서브에이전트 vs 스킬

둘 다 `/slash-command` 스타일 인터페이스를 만들지만, 다른 문제를 해결합니다:

| | 스킬 | 서브에이전트 |
|---|--------|-----------|
| 컨텍스트 | 메인 대화에서 실행 | 자체 격리된 컨텍스트에서 실행 |
| 적합한 용도 | 참조 자료, 재사용 가능한 워크플로우 | 장황한 출력을 생산하는 작업 |
| 도구 제어 | 도구 제한 없음 | 세밀한 도구 허용 목록 |
| 체이닝 가능 | 아니오 | 아니오 (메인 대화에서 체이닝은 가능) |