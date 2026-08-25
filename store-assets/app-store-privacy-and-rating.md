# App Store Connect: App Privacy & Age Rating 답변 가이드

실제 앱 동작(AdMob 전면 광고, 서버 없음, 로그인 없음)을 기준으로 작성했습니다.
제출 직전 App Store Connect 화면과 문구가 바뀌었을 수 있으니, 실제 옵션과 대조하면서 채우세요.

## App Privacy (데이터 수집 설문)

**"데이터를 수집합니까?"** → 예 (Yes)

**수집 데이터 유형**: Identifiers → Device ID (광고 식별자, IDFA)

- **용도 (Purpose)**: Third-Party Advertising
- **사용자와 연결됨 (Linked to you)?**: 아니오 (No) — 로그인/계정이 없으므로
- **추적 목적 사용 (Used to Track You)?**: 예 (Yes)
  - AdMob 개인화 광고를 위해 IDFA를 사용하므로 Apple 기준상 "Tracking"에 해당합니다.
  - 이 항목을 "Yes"로 표시하면 App Store 앱 페이지에 "이 앱은 다른 회사의 앱·웹사이트에서 귀하를 추적할 수 있습니다" 배지가 표시됩니다. 정상입니다.

**그 외 데이터 유형 (연락처, 위치, 사용 데이터 등)**: 수집 안 함
- 배달 정보 입력 폼은 서버 전송 없이 화면 표시 용도로만 사용되므로 "수집"에 해당하지 않습니다.

> AdMob SDK 버전에 따라 실제 수집 항목이 달라질 수 있습니다. Google이 제공하는
> [AdMob용 App Store 개인정보 정보 매핑 가이드](https://support.google.com/admob/answer/13554158)를
> Mac 세션에서 한 번 더 확인하고 대조하세요.

## Age Rating (연령 등급 설문)

모든 콘텐츠 항목에 "없음(None)"으로 답하면 됩니다 — 이 앱은 폭력, 선정성, 도박(실제 베팅 없음), 욕설, 약물 관련 콘텐츠가 전혀 없는 시뮬레이션 앱입니다.

- 실제 같은 도박(Simulated Gambling): 없음
- 폭력/공포/성적 콘텐츠: 없음
- 욕설/저속한 유머: 없음
- 주류·담배·약물 언급: 없음
- 제3자 광고 있음(Advertising)?: 예 — AdMob 전면 광고 있음
- 사용자 생성 콘텐츠 / 커뮤니케이션 기능: 없음

→ 예상 등급: **4+**

## App Store 심사 참고사항 (App Review Information)

App Review 노트에 아래 문구를 영어로 남겨두면 심사자가 앱의 "가짜 배달" 컨셉을 오해하지 않습니다.

```
This app is a satirical/demo "fake food delivery" simulator. No real ordering,
payment, or delivery ever happens — all restaurants, menus, and tracking are
fictional and simulated entirely on-device. The app shows an occasional
interstitial ad via Google AdMob on cold start (~30% probability). No login,
no backend server, no data is transmitted except to Google AdMob for ad
serving. Contact: eggmari5713@gmail.com
```

로그인 계정이 없으므로 "데모 계정" 항목은 비워두면 됩니다.
