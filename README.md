# Clindar

클린더 : 클라이밍 캘린더

## 목적

- 클머들에게 편리한 클라이밍 전용 캘린더를 제공

## 기능

- 유저
  - 로그인 / 로그아웃 (구글, 카카오 OAuth)
  - 회원 탈퇴
  - 닉네임 설정 / 변경
- 그룹
  - 생성 / 삭제
  - 가입 (수락 절차 x, 공개/비공개 설정 - 비공개면 비밀번호)
- 일정
  - 추가 / 삭제 / 수정
  - 같이하기 / 초대 (수락 절차 x, 공개할 그룹 선택)
  - 기록
- 위젯
- 암장 이용자 수 (등록된 일정 기반)

### commit message

- feat : 새로운 기능에 대한 커밋
- fix : 버그 수정에 대한 커밋
- build : 빌드 관련 파일 수정에 대한 커밋
- chore : 그 외 자잘한 수정에 대한 커밋
- ci : CI관련 설정 수정에 대한 커밋
- docs : 문서 수정에 대한 커밋
- style : 코드 스타일 혹은 포맷 등에 관한 커밋
- refactor : 코드 리팩토링에 대한 커밋
- test : 테스트 코드 수정에 대한 커밋
- design : 사용자 UI 디자인 변경(CSS 등)에 대한 커밋
- perf : 성능 개선에 대한 커밋
- rename : 파일 혹은 폴더명 수정에 대한 커밋
- remove : 파일 삭제에 대한 커밋

### 개발용 server 실행

- server 폴더로 이동
- env 파일 세팅 (DB_SECRET, SALT)
- npm i
- npm run start:dev
