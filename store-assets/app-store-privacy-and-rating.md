# App Store Connect: App Privacy & Age Rating 답변 가이드

실제 앱 동작(AdMob 전면 광고, Firebase 백엔드, 로그인 없음)을 기준으로 작성했습니다.
제출 직전 App Store Connect 화면과 문구가 바뀌었을 수 있으니, 실제 옵션과 대조하면서 채우세요.

## App Privacy (데이터 수집 설문)

**"데이터를 수집합니까?"** → 예 (Yes)

### 1) Identifiers → Device ID (광고 식별자, IDFA)

- **용도 (Purpose)**: Third-Party Advertising
- **사용자와 연결됨 (Linked to you)?**: 아니오 (No) — 로그인/계정이 없으므로
- **추적 목적 사용 (Used to Track You)?**: 예 (Yes)
  - AdMob 개인화 광고를 위해 IDFA를 사용하므로 Apple 기준상 "Tracking"에 해당합니다.
  - 이 항목을 "Yes"로 표시하면 App Store 앱 페이지에 "이 앱은 다른 회사의 앱·웹사이트에서 귀하를 추적할 수 있습니다" 배지가 표시됩니다. 정상입니다.

> AdMob SDK 버전에 따라 실제 수집 항목이 달라질 수 있습니다. Google이 제공하는
> [AdMob용 App Store 개인정보 정보 매핑 가이드](https://support.google.com/admob/answer/13554158)를
> Mac 세션에서 한 번 더 확인하고 대조하세요.

### 2) Identifiers → User ID (Firebase 익명 인증 UID)

로그인은 없지만, 기기별로 주문 기록·업적을 구분하기 위해 Firebase 익명 인증이 발급하는
임의 UID를 사용합니다 (실명·이메일 등 신원 정보 없음).

- **용도**: App Functionality
- **사용자와 연결됨?**: 아니오 (No) — 실제 신원과 연결되지 않는 기기 단위 익명 식별자
- **추적 목적 사용?**: 아니오 (No)

### 3) Purchase History 대신 → App Functionality 데이터 (주문 기록·업적)

Firestore에 저장되는 데모 주문 기록(메뉴, 가격, 배달 방식, 시간)과 업적 데이터.
"Purchases"가 아니라 앱 자체 기능 데이터이므로 Apple 카테고리 중 가장 가까운 항목으로
표시하세요 (예: **Other Data → App Functionality**, 또는 제출 시점 화면의 유사 카테고리).

- **용도**: App Functionality
- **사용자와 연결됨?**: 아니오 (No) — 익명 UID에만 연결, 실명·이메일과 연결되지 않음
- **추적 목적 사용?**: 아니오 (No)

### 4) User Content → Photos or Videos, Other User Content

"내 식당 추가" 기능으로 이용자가 직접 등록하는 음식점/메뉴 이름·설명·사진. 다른 이용자에게
**공개**되며, 신고 누적 시 자동 숨김 처리됩니다.

- **용도**: App Functionality
- **사용자와 연결됨?**: 아니오 (No) — 익명 UID에만 연결
- **추적 목적 사용?**: 아니오 (No)

### 그 외 데이터 유형 (연락처, 정확한 위치, 이메일 등): 수집 안 함

- 체크아웃 폼에 입력하는 이름·주소·연락처는 서버로 전송되지 않고 기기에만 남으므로 "수집"에
  해당하지 않습니다.
- 배달 추적 화면에서 위치 권한을 요청하지만, 화면에 표시하는 용도로만 즉시 사용될 뿐 서버로
  전송되거나 저장되지 않습니다 — "정확한 위치" 데이터 수집으로 표시하지 않아도 됩니다.

## Age Rating (연령 등급 설문)

모든 콘텐츠 항목에 "없음(None)"으로 답하면 됩니다 — 이 앱은 폭력, 선정성, 도박(실제 베팅 없음), 욕설, 약물 관련 콘텐츠가 전혀 없는 시뮬레이션 앱입니다.

- 실제 같은 도박(Simulated Gambling): 없음
- 폭력/공포/성적 콘텐츠: 없음
- 욕설/저속한 유머: 없음
- 주류·담배·약물 언급: 없음
- 제3자 광고 있음(Advertising)?: 예 — AdMob 전면 광고 있음
- 사용자 생성 콘텐츠(User Generated Content): 예 — "내 식당 추가" 기능으로 이용자가 이름·설명·
  사진을 등록해 다른 이용자에게 공개됨. 신고 누적 시 자동 숨김되는 모더레이션 기능 있음 (실시간
  채팅·1:1 메시지 등 이용자 간 커뮤니케이션 기능은 없음).

→ 예상 등급: **4+** (UGC 항목에 "예"로 답해도, 채팅 등 이용자 간 직접 소통이 없고 콘텐츠 성격상
자체적으로 폭력적/선정적일 수 없는 텍스트+음식 사진 위주라 보통 4+ 유지됨 — 실제 제출 화면에서
UGC 관련 추가 질문이 뜨면 위 설명대로 답하세요.)

## App Store 심사 참고사항 (App Review Information)

App Review 노트에 아래 문구를 영어로 남겨두면 심사자가 앱의 "가짜 배달" 컨셉을 오해하지 않습니다.

```
This app is a satirical/demo "fake food delivery" simulator. No real ordering,
payment, or delivery ever happens — all restaurants, menus, and tracking are
fictional and simulated entirely on-device. The app shows an occasional
interstitial ad via Google AdMob on cold start (~30% probability). There is no
login — each device is identified only by an anonymous Firebase Auth ID. The
app stores demo order history/achievements (tied only to that anonymous ID)
and optional user-submitted restaurant/menu content (name, description,
photo) in Firebase/Firestore; user-submitted content is public to all users
and is auto-hidden once enough users report it. The name/address/phone typed
on the checkout form is never sent to a server. Contact: eggmari5713@gmail.com
```

로그인 계정이 없으므로 "데모 계정" 항목은 비워두면 됩니다.
