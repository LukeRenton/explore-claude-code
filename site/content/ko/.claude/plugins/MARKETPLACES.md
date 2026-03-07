# 플러그인 마켓플레이스

마켓플레이스는 플러그인을 나열하고 Claude Code에게 어디서 가져올지 알려주는 카탈로그입니다. 중앙 집중식 발견, 버전 추적, 자동 업데이트를 제공합니다. 팀, 커뮤니티 또는 공개용으로 마켓플레이스를 만들 수 있습니다.

## 빠른 시작

1. `.claude-plugin/marketplace.json`이 있는 디렉토리를 만드세요
2. 이름, 소스, 설명과 함께 플러그인을 나열하세요
3. GitHub(또는 다른 git 호스트)에 푸시하세요
4. 사용자가 추가합니다: `/plugin marketplace add owner/repo`
5. 사용자가 플러그인을 설치합니다: `/plugin install my-plugin@your-marketplace`

## 작동 방식

1. **플러그인을 만듭니다**: 스킬, 에이전트, 훅, MCP 서버 또는 LSP 서버가 포함된 플러그인
2. **`marketplace.json`을 만듭니다**: 플러그인 목록과 위치를 기록합니다
3. **호스팅합니다**: GitHub, GitLab 또는 다른 git 호스트에
4. **사용자가 마켓플레이스를 추가합니다**: 개별 플러그인을 설치합니다
5. **사용자가 업데이트를 받습니다**: `/plugin marketplace update` 실행으로

## 마켓플레이스 스키마

`marketplace.json` 파일은 저장소 루트의 `.claude-plugin/marketplace.json`에 위치합니다.

### 필수 필드

| 필드 | 타입 | 목적 |
|---|---|---|
| `name` | string | 마켓플레이스 식별자 (kebab-case). 사용자가 설치 시 보는 이름: `/plugin install tool@your-marketplace` |
| `owner` | object | 관리자 정보: `name` (필수), `email` (선택) |
| `plugins` | array | 사용 가능한 플러그인 목록 |

### 선택적 메타데이터

| 필드 | 목적 |
|---|---|
| `metadata.description` | 간단한 마켓플레이스 설명 |
| `metadata.version` | 마켓플레이스 버전 |
| `metadata.pluginRoot` | 상대적 플러그인 소스 경로 앞에 붙는 기본 디렉토리 |

## 플러그인 소스

각 플러그인 항목에는 `name`과 `source`가 필요합니다. 소스는 Claude Code에게 플러그인을 어디서 가져올지 알려줍니다:

| 소스 | 형식 | 참고 |
|---|---|---|
| 상대 경로 | `"./plugins/my-plugin"` | 마켓플레이스 저장소 내. `./`로 시작해야 합니다 |
| GitHub | `{ "source": "github", "repo": "owner/repo" }` | `ref` (브랜치/태그)와 `sha` (커밋) 고정 지원 |
| Git URL | `{ "source": "url", "url": "https://...git" }` | 모든 git 호스트. URL이 `.git`으로 끝나야 합니다 |
| Git 하위 디렉토리 | `{ "source": "git-subdir", "url": "...", "path": "..." }` | 모노레포의 하위 디렉토리를 sparse clone |
| npm | `{ "source": "npm", "package": "@org/plugin" }` | `version` 범위와 커스텀 `registry` 지원 |
| pip | `{ "source": "pip", "package": "plugin" }` | pip를 통해 설치 |

### 버전 고정

GitHub과 git 소스는 `ref` (브랜치 또는 태그)와 `sha` (정확한 커밋)를 지원합니다:

```json
{
  "name": "my-plugin",
  "source": {
    "source": "github",
    "repo": "company/my-plugin",
    "ref": "v2.0.0",
    "sha": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  }
}
```

## 호스팅

### GitHub (권장)

저장소를 만들고, `.claude-plugin/marketplace.json`을 추가하고 공유하세요. 사용자는 다음으로 추가합니다:

```
/plugin marketplace add owner/repo
```

### 비공개 저장소

Claude Code는 기존 git 자격 증명을 사용합니다. 터미널에서 `git clone`이 작동하면 Claude Code에서도 작동합니다. 백그라운드 자동 업데이트를 위해 환경에 토큰을 설정하세요:

| 제공자 | 환경 변수 |
|---|---|
| GitHub | `GITHUB_TOKEN` 또는 `GH_TOKEN` |
| GitLab | `GITLAB_TOKEN` 또는 `GL_TOKEN` |
| Bitbucket | `BITBUCKET_TOKEN` |

## 팀 배포

팀원이 자동으로 마켓플레이스 설치를 요청받도록 저장소를 설정하세요. `.claude/settings.json`에 추가합니다:

```json
{
  "extraKnownMarketplaces": {
    "company-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  },
  "enabledPlugins": {
    "code-formatter@company-tools": true
  }
}
```

### 관리형 제한

관리자는 [관리형 설정](^IT/DevOps가 관리하는 조직 수준 설정으로 개별 사용자가 오버라이드할 수 없습니다)에서 `strictKnownMarketplaces`를 사용하여 사용자가 추가할 수 있는 마켓플레이스를 제한할 수 있습니다:

| 값 | 동작 |
|---|---|
| 미정의 (기본값) | 제한 없음. 사용자가 모든 마켓플레이스를 추가 가능 |
| 빈 배열 `[]` | 완전 잠금. 새 마켓플레이스 추가 불가 |
| 소스 목록 | 사용자는 허용 목록과 일치하는 마켓플레이스만 추가 가능 |

## Strict 모드

플러그인 항목의 `strict` 필드는 누가 플러그인의 컴포넌트를 정의하는지 제어합니다:

| 값 | 동작 |
|---|---|
| `true` (기본값) | `plugin.json`이 권한 소스. 마켓플레이스 항목이 추가 컴포넌트로 보충 가능 |
| `false` | 마켓플레이스 항목이 전체 정의. 플러그인에 컴포넌트가 있는 `plugin.json`도 있으면 로드 실패 |

마켓플레이스 운영자가 노출되는 컴포넌트를 완전히 제어하려면 `strict: false`를 사용하세요.

## 릴리스 채널

같은 저장소의 다른 ref를 가리키는 두 마켓플레이스를 만들어 "stable"과 "latest" 채널을 설정하세요. 관리형 설정을 통해 다른 사용자 그룹에 할당하세요.

플러그인의 `plugin.json`은 각 고정된 ref에서 다른 `version`을 선언해야 합니다. 두 ref의 버전이 같으면 Claude Code가 업데이트를 건너뜁니다.

## 검증

공유하기 전에 마켓플레이스를 테스트하세요:

```bash
claude plugin validate .
```

또는 Claude Code 내에서:

```
/plugin validate .
/plugin marketplace add ./my-local-marketplace
/plugin install test-plugin@my-local-marketplace
```

## 예약된 이름

다음 마켓플레이스 이름은 공식 Anthropic 용도로 예약되어 있습니다: `claude-code-marketplace`, `claude-code-plugins`, `claude-plugins-official`, `anthropic-marketplace`, `anthropic-plugins`, `agent-skills`, `life-sciences`. 공식 마켓플레이스를 사칭하는 이름도 차단됩니다.

## 팁

- 상대 경로는 사용자가 git을 통해 마켓플레이스를 추가할 때만 작동합니다 (`marketplace.json`에 대한 직접 URL이 아닌)
- 플러그인은 설치 시 캐시에 복사됩니다. 플러그인이 파일을 공유해야 하면 심볼릭 링크를 사용하세요
- `CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS`를 설정하여 대형 저장소의 120초 git 타임아웃을 늘리세요
- `metadata.pluginRoot`를 사용하여 소스 경로를 단순화하세요: `"./plugins"`로 설정하면 `"source": "./plugins/formatter"` 대신 `"source": "formatter"`로 작성 가능

## 추가 자료
- [마켓플레이스 문서](https://code.claude.com/docs/en/plugin-marketplaces)
- [플러그인 발견](https://code.claude.com/docs/en/discover-plugins)