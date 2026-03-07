다음에 대한 테스트를 작성합니다: $ARGUMENTS

다음 컨벤션을 따르세요:
- Jest와 TypeScript 사용
- `describe` / `it` 블록 사용 (`test()` 아님)
- 메서드 이름이 아닌 동작 기준으로 그룹화
- 외부 서비스(데이터베이스, API) 모킹 - 실제 엔드포인트에 절대 접근하지 않음
- 엣지 케이스 포함: 빈 입력, null, 경계값, 에러 경로
- 설명적인 테스트 이름 사용: `it('returns 404 when user does not exist')`

구조:
```
describe('ComponentOrFunction', () => {
  describe('when condition', () => {
    it('should expected behaviour', () => {
      // Arrange → Act → Assert
    });
  });
});
```

테스트 작성 후 `npm test`를 실행하여 통과하는지 확인하세요.