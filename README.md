# NUV downloads

NUV 정식 설치 페이지와 테스트 채널을 제공하는 저장소입니다.

- 정식 설치: `/`
- 테스트 설치: `/beta/`
- 정식 업데이트 정보: `/version.json`
- 테스트 업데이트 정보: `/beta/version.json`

## 배포 순서

1. 개발 빌드와 시험용 GitHub 사전 릴리스를 만든다.
2. `/beta/index.html`과 `/beta/version.json`만 시험용 파일로 갱신한다.
3. PC와 Android에서 설치, 업데이트, 연결, 주요 동작을 검증한다.
4. 검증이 끝난 동일한 파일과 체크섬을 정식 릴리스에 사용한다.
5. 마지막으로 루트 `index.html`과 `version.json`을 갱신한다.

정식 채널은 테스트가 끝나기 전에는 변경하지 않습니다.

