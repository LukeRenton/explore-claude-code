#!/bin/bash
# .claude/hooks/my-hook.sh
#
# Bash 명령어가 실행되기 전에 검사하는 PreToolUse 훅입니다.
# Claude는 stdin으로 JSON 컨텍스트를 보냅니다. 스크립트가 이를 읽고
# 조건을 확인한 후 적절한 코드로 종료합니다:
#
#   exit 0   도구 호출을 허용
#   exit 2   차단 (stderr가 Claude에게 에러로 피드백됨)
#
# 이 훅을 .claude/settings.json에 등록하세요:
#
#   {
#     "hooks": {
#       "PreToolUse": [
#         {
#           "matcher": "Bash",
#           "hooks": [
#             {
#               "type": "command",
#               "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/my-hook.sh"
#             }
#           ]
#         }
#       ]
#     }
#   }

# ── stdin에서 JSON 입력 읽기 ──────────────────────────────────
# 모든 훅은 공통 필드(session_id, cwd, hook_event_name)와
# 이벤트별 필드가 포함된 JSON 객체를 받습니다.
# Bash에 대한 PreToolUse의 경우 핵심 필드는 tool_input.command입니다.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

# ── 조건 확인 ────────────────────────────────────────────────
# 이 예제는 파괴적인 셸 명령어를 차단합니다. 이 로직을
# 프로젝트에 필요한 검증으로 대체하세요: 파일 경로 확인,
# 환경 게이트, 명령어 허용 목록 등.

if echo "$COMMAND" | grep -q 'rm -rf'; then
  # stderr가 Claude에게 에러 메시지로 전달됩니다
  echo "차단됨: 'rm -rf'는 프로젝트 훅에 의해 허용되지 않습니다." >&2
  exit 2
fi

if echo "$COMMAND" | grep -q 'git push.*--force'; then
  echo "차단됨: 강제 푸시는 프로젝트 훅에 의해 허용되지 않습니다." >&2
  exit 2
fi

# ── 나머지 모두 허용 ─────────────────────────────────────────
# 출력 없이 exit 0은 "정상 진행"을 의미합니다. 더 세밀한
# 제어를 위해 stdout에 JSON을 출력할 수도 있습니다:
#
#   # 자동 승인 (권한 프롬프트 건너뛰기):
#   echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
#
#   # Claude가 볼 수 있는 이유와 함께 거부:
#   echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"사유"}}'
#
#   # 사용자에게 확인 요청:
#   echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask"}}'
#
#   # 실행 전 도구 입력 수정:
#   echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","updatedInput":{"command":"더-안전한-명령어"}}}'

exit 0