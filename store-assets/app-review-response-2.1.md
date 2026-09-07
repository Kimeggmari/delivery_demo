# Guideline 2.1 "Information Needed" 답변 초안 (2026-08-28)

App Store Connect → 해당 버전 → **Reply**(Resolution Center)에 아래 내용을 영어로 붙여넣으세요.
7개 요구 항목 중 2~7번은 이 파일 그대로 쓰면 되고, **1번만 실기기로 직접 녹화**해야 합니다.

---

## 1. Screen recording (사용자가 직접 촬영 — 이 부분만 남음)

**요구조건**: "최신 OS가 깔린 실제 기기(physical device)"에서 녹화, 앱 실행부터 시작해서 핵심 기능
흐름을 보여줘야 함. 이 앱 기준으로 없는 항목(로그인/가입/탈퇴, 결제/구독)은 안 찍어도 되고,
**있는 항목만** 넣으면 됩니다:

- [ ] 앱 실행 → 홈/메뉴 화면
- [ ] 장바구니 담기 → 옵션(맵기/사이즈/토핑) 선택 → 체크아웃
- [ ] 배달 추적 화면 진입 시 **위치 권한 프롬프트**가 뜨는 장면 (반드시 포함 — "sensitive data" 프롬프트 요구사항)
- [ ] 앱 시작 시 전면 광고가 뜨면(뜰 때까지 몇 번 재실행) 그 장면, + **ATT(트래킹 허용) 프롬프트**도 같이 (안 뜨면 앱 삭제 후 재설치해서 재현)
- [ ] "내 식당 추가" 기능: 사진 첨부해서 등록하는 화면 (User-Generated Content)
- [ ] 다른 사용자가 올린 항목을 **신고(report)하는 버튼/흐름** (신고 3회 누적 시 자동 숨김되는 그 기능 — "content reporting and blocking mechanisms" 요구사항에 정확히 대응)
- [ ] 주문 완료 화면 / 절약한 칼로리 표시 화면

실기기(아이폰)로 iOS 앱을 아직 못 깔아봤다면, Mac + 케이블로 기기에 설치 후 화면 녹화(Mac에
연결하고 QuickTime에서 iPhone을 녹화 소스로 선택하거나, 아이폰 자체 화면 녹화 기능 사용)
하면 됩니다.

## 2. Devices tested on

*(사용자가 실제 테스트한 기기/OS로 채워야 함 — 아래는 예시, 실제 값으로 교체)*

```
Tested on: iPhone <실제 모델명, 예: 15> running iOS <실제 버전, 예: 18.x>
(and iOS Simulator — iPhone 16 Pro Max, iOS 18) during development.
```

## 3. Description of app's functions and target audience

```
FoodNeverArrives ("음식만안와요") is a satirical food-delivery simulator. It recreates
the full UX of browsing restaurants, building a cart, checking out, and watching a
courier travel to your location on a map — but no real order, payment, or delivery
ever happens. Everything is fictional and simulated entirely on-device/in our
Firebase backend.

Target audience: people who reach for a real delivery app out of habit or impulse.
Opening this app instead lets them get the same craving-scratch/browsing satisfaction
without the cost or calories of an actual order — the app shows "calories saved" at
the end of each simulated order.
```

## 4. Setup / access instructions (no login, no credentials needed)

```
There is no account registration, login, or sign-in of any kind — the app has no
demo account because none is required. On first launch it silently creates an
anonymous Firebase Auth identity (no UI, no user action) used only to keep each
device's own order history/achievements separate. No sample files or special setup
are needed; the app is fully usable immediately after install.
```

## 5. External services / tools used

```
- Firebase (Firestore + Anonymous Authentication) — stores per-device demo order
  history/achievements, and shared user-submitted restaurant/menu content
  (name, description, photo).
- Google Maps SDK for iOS — renders the fake courier-tracking map using the
  device's real GPS location (for display only; location is never sent to a
  server or stored).
- Google AdMob — occasional full-screen interstitial ad on cold start (~30%
  probability).
- No payment processor is used or needed — no real purchases occur anywhere
  in the app.
- No AI/ML services are used.
```

## 6. Regional differences

```
The app functions identically in all regions/countries. It supports Korean and
English via an in-app language toggle; there is no region-locked content or
functionality.
```

## 7. Regulated industry / protected third-party material

```
Not applicable. The app does not operate in a regulated industry (it does not
process real food orders, real payments, or real deliveries of any kind — the
"delivery" concept is entirely fictional/satirical) and contains no third-party
protected material; all restaurant/menu content is either fictional (developer-
created) or user-submitted original text/photos.
```

---

**참고**: 위 5~7번 문구는 [app-store-privacy-and-rating.md](app-store-privacy-and-rating.md)에
이미 있던 "심사 참고사항" 문단을 이번 7개 항목 형식에 맞게 확장한 것입니다. 신고/차단 흐름
설명은 이번이 처음 명시적으로 요구된 것이라 새로 추가했습니다.
