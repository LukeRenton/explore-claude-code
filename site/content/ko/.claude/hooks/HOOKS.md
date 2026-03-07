# 훅

훅은 Claude Code 세션의 특정 시점에 자동으로 실행되는 커스텀 스크립트입니다. 도구 호출을 가로채고, 변경사항을 검증하고, 규칙을 적용하고, Claude를 기존 개발 워크플로우에 연결할 수 있습니다.

## 빠른 시작

1. `.claude/settings.json`을 열거나 세션에서 `/hooks`를 실행합니다
2. 가로채려는 이벤트(예: `PreToolUse`, `PostToolUse`) 아래에 훅 항목을 추가합니다
3. stdin에서 JSON을 읽고 검사한 후 코드 0(허용) 또는 2(차단)로 종료하는 스크립트를 작성합니다
4. Claude Code를 재시작합니다. 훅은 시작 시 스냅샷됩니다

## 훅의 작동 방식

Claude가 수행하는 모든 동작은 [훅 이벤트](^PreToolUse나 PostToolUse 같은 훅이 실행될 수 있는 명명된 생명주기 시점)를 발생시킵니다. 설정을 통해 어떤 이벤트를 감시하고 발생 시 무엇을 실행할지 Claude Code에 알려줍니다.

1. **이벤트 발생**. Claude가 도구를 호출하려 하거나, 응답을 완료하거나, 세션을 시작하는 등의 시점
2. **매처 확인**. 매처(도구 이름이나 이벤트 소스에 대한 정규식)를 정의했다면, 매칭되는 이벤트만 훅을 트리거합니다
3. **훅 핸들러 실행**. 스크립트(또는 HTTP 엔드포인트, LLM 프롬프트)가 stdin으로 JSON 컨텍스트를 받습니다
4. **Claude가 결과에 따라 동작**. 종료 코드 0은 허용, 종료 코드 2는 차단(지원하는 이벤트의 경우). JSON 출력으로 더 세밀한 제어 가능

## 훅 이벤트

훅은 Claude 생명주기의 다음 시점에서 발생합니다. 에이전트 루프의 이벤트는 Claude가 작업하는 동안 반복적으로 발생합니다:

| 이벤트 | 발생 시점 | 차단 가능? |
|---|---|---|
| `SessionStart` | 세션 시작 또는 재개 | 아니오 |
| `UserPromptSubmit` | 프롬프트 제출 시, Claude 처리 전 | 예 |
| `PreToolUse` | 도구 호출 실행 전 | 예 |
| `PermissionRequest` | 권한 대화상자가 표시될 때 | 예 |
| `PostToolUse` | 도구 호출 성공 후 | 피드백만 |
| `PostToolUseFailure` | 도구 호출 실패 후 | 피드백만 |
| `Stop` | Claude가 응답을 완료할 때 | 예 (계속 강제) |
| `SubagentStart` | 서브에이전트 생성 시 | 아니오 |
| `SubagentStop` | 서브에이전트 완료 시 | 예 |
| `Notification` | Claude가 알림을 보낼 때 | 아니오 |
| `TeammateIdle` | 에이전트 팀원이 유휴 상태가 될 때 | 예 |
| `TaskCompleted` | 작업이 완료로 표시될 때 | 예 |
| `ConfigChange` | 설정 파일이 변경될 때 | 예 |
| `PreCompact` | 컨텍스트 압축 전 | 아니오 |
| `SessionEnd` | 세션 종료 시 | 아니오 |

## 설정

훅은 설정 파일에서 정의됩니다. 세 단계의 중첩 구조:

1. **훅 이벤트**: 어떤 생명주기 시점에 응답할지
2. **매처 그룹**: 정규식 필터 (예: `Bash` 도구에만 적용)
3. **훅 핸들러**: 실행할 스크립트, 엔드포인트, 프롬프트 또는 에이전트

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/validate-bash.sh"
          }
        ]
      }
    ]
  }
}
```

### 훅 정의 위치

| 위치 | 범위 | 커밋 여부 |
|---|---|---|
| `~/.claude/settings.json` | 모든 개인 프로젝트 | 아니오 |
| `.claude/settings.json` | 이 프로젝트, 공유 | 예 |
| `.claude/settings.local.json` | 이 프로젝트, 개인 | 아니오 |
| 플러그인 `hooks/hooks.json` | 플러그인이 활성화된 곳 | 예 |
| 스킬/에이전트 frontmatter | 컴포넌트가 활성 상태일 때 | 예 |

### 매처 패턴

`matcher`는 이벤트에 따라 다른 필드에 매칭되는 정규식입니다:

- **도구 이벤트** (`PreToolUse`, `PostToolUse` 등): `tool_name`에 매칭 (예: `Bash`, `Edit|Write`, `mcp__github__.*`)
- **SessionStart**: 세션 시작 방식에 매칭 (`startup`, `resume`, `clear`, `compact`)
- **SessionEnd**: 세션 종료 이유에 매칭 (`clear`, `logout`, `other`)
- **Notification**: 알림 유형에 매칭 (`permission_prompt`, `idle_prompt`)
- **SubagentStart/Stop**: 에이전트 유형에 매칭 (`Bash`, `Explore`, `Plan` 또는 커스텀 이름)

매처를 생략하거나 `"*"`를 사용하면 모든 것에 매칭됩니다. `UserPromptSubmit`과 `Stop` 같은 일부 이벤트는 매처를 지원하지 않으며 항상 발생합니다.

### 훅 핸들러 유형

| 유형 | 작동 방식 |
|---|---|
| `command` | 셸 명령어를 실행합니다. stdin으로 JSON을 받습니다. 종료 코드와 stdout으로 통신합니다 |
| `http` | URL로 JSON을 POST 요청으로 보냅니다. 응답 본문이 결정을 제어합니다 |
| `prompt` | Claude 모델에 입력을 보내 단일 턴 예/아니오 평가를 합니다 |
| `agent` | 도구 접근(Read, Grep, Glob)이 가능한 서브에이전트를 생성하여 조건을 검증합니다 |

모든 이벤트가 모든 유형을 지원하지는 않습니다. `SessionStart`, `Notification`, `PreCompact` 등은 `command` 훅만 지원합니다.

## 입력과 출력

### 훅이 받는 데이터

모든 훅은 stdin(HTTP 훅의 경우 POST 본문)으로 이 JSON을 받습니다:

```json
{
  "session_id": "abc123",
  "cwd": "/home/user/my-project",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
```

`tool_name`과 `tool_input` 필드는 이벤트마다 다릅니다. 각 이벤트는 공통 필드 위에 자체 필드를 추가합니다.

### 종료 코드

| 코드 | 의미 |
|---|---|
| `0` | 성공. Claude Code가 선택적 JSON 출력을 위해 stdout을 파싱합니다 |
| `2` | 차단 에러. stderr가 Claude에게 에러 메시지로 전달됩니다. 효과는 이벤트에 따라 다릅니다 |
| 기타 | 비차단 에러. stderr가 verbose 모드에서 표시되고 실행이 계속됩니다 |

### JSON 출력

더 세밀한 제어를 위해 종료 코드 대신 exit 0으로 종료하고 stdout에 JSON을 출력합니다:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "파괴적 명령어가 차단되었습니다"
  }
}
```

범용 JSON 필드는 모든 이벤트에서 작동합니다:

| 필드 | 효과 |
|---|---|
| `continue` | `false`이면 Claude가 처리를 완전히 중단합니다 |
| `stopReason` | `continue`가 false일 때 사용자에게 표시되는 메시지 |
| `suppressOutput` | `true`이면 verbose 모드에서 stdout을 숨깁니다 |
| `systemMessage` | 사용자에게 표시되는 경고 메시지 |

## 비동기 훅

커맨드 훅에 `"async": true`를 추가하면 백그라운드에서 실행됩니다. Claude는 훅이 실행되는 동안 즉시 작업을 계속합니다. 결과는 다음 대화 턴에 전달됩니다.

```json
{
  "type": "command",
  "command": ".claude/hooks/run-tests.sh",
  "async": true,
  "timeout": 120
}
```

비동기 훅은 도구 호출을 차단하거나 결정을 반환할 수 없습니다. 테스트 스위트, 배포 또는 알림을 Claude의 작업과 병행하여 실행하는 데 유용합니다.

## 일반적인 패턴

**위험한 명령어 차단** (Bash에 대한 PreToolUse): `tool_input.command`를 파싱하고 `rm -rf` 등 파괴적 패턴을 확인하여 exit 2로 차단합니다.

**편집 후 자동 포매팅** (Write|Edit에 대한 PostToolUse): 변경된 파일에 린터나 포매터를 실행하고 출력을 Claude에 피드백합니다.

**변경 후 타입 체크** (Write|Edit에 대한 PostToolUse): TypeScript 변경 후 `tsc --no-emit`을 실행하면 Claude가 에러를 보고 호출 사이트를 수정합니다.

**중복 코드 방지** (Write에 대한 PostToolUse): 보조 Claude 인스턴스를 실행하여 기존 패턴 대비 새 코드를 리뷰합니다.

**중지 전 품질 게이트** (Stop): Claude가 완료하기 전에 테스트 통과 여부나 필수 파일 존재를 확인합니다.

**시작 시 환경 주입** (SessionStart): `$CLAUDE_ENV_FILE`에 `export` 문을 작성하여 세션의 환경 변수를 설정합니다.

## 팁

- 훅은 세션 시작 시 스냅샷됩니다. 훅 설정 변경 후 Claude를 재시작하세요
- 명령어에서 `$CLAUDE_PROJECT_DIR`를 사용하여 프로젝트 루트 기준으로 스크립트를 참조하세요
- 세션에서 `/hooks`를 사용하여 훅을 대화형으로 보고, 추가하고, 삭제하세요
- `claude --debug`를 실행하여 훅 실행 세부사항과 종료 코드를 확인하세요
- 설정에서 `"disableAllHooks": true`로 모든 훅을 일시적으로 비활성화하세요
- 훅을 빠르게 유지하세요. 기본 타임아웃은 명령어 600초, 프롬프트 30초입니다
- 셸 변수를 따옴표로 감싸고(`"$VAR"`, `$VAR` 아님) 입력을 검증하세요. 훅 스크립트는 전체 사용자 권한으로 실행됩니다
- MCP 도구의 경우 `mcp__github__.*` 또는 `mcp__.*__write.*` 같은 패턴으로 매칭하세요
- 프롬프트 및 에이전트 훅은 종료 코드 대신 `{"ok": true/false, "reason": "..."}` 를 반환합니다

[훅 레퍼런스](https://code.claude.com/docs/en/hooks) |
[훅 가이드](https://code.claude.com/docs/en/hooks-guide)