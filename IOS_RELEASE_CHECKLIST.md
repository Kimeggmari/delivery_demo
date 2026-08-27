# iOS 출시 체크리스트 — 맥북 3시간 세션용

Windows에서 미리 준비된 것: `ios/` Xcode 프로젝트, 앱 아이콘/스플래시, Info.plist의 AdMob/ATT 설정,
`store-assets/`의 App Store Connect 등록 문구, `public/support.html`. 나머지는 Mac + Xcode + Apple
Developer 계정이 있어야만 할 수 있는 작업입니다.

**"3시간 안에 출시"의 의미**: 3시간은 "심사 제출(Submit for Review)"까지의 시간입니다. 제출 후 Apple
심사(보통 1~3일)는 자동으로 진행되며 그동안 Mac이 없어도 됩니다. 심사 통과 후 실제로 스토어에 뜨는
시점은 "자동 출시" 또는 "수동 출시"를 어떻게 선택했는지에 따라 다릅니다 (아래 15번 참고).

---

## 지금 당장 (Mac 세션 전에, 시간 여유 있을 때 미리 해두세요)

이 두 가지는 승인/생성에 시간이 걸리거나 3시간 예산을 깎아먹으니 **미리** 끝내두는 걸 강력 추천합니다.

- [ ] **Apple Developer Program 가입** (developer.apple.com, 연 $99). 개인 가입은 즉시~수 시간,
      법인 가입은 1~2일 걸릴 수 있음.
- [x] **AdMob 콘솔(apps.admob.com)에 iOS 앱 등록** → iOS용 App ID + 전면 광고 단위(ad unit) 생성.
      (2026-08-27 완료) App ID `ca-app-pub-5173827714526228~5088841963`를
      [ios/App/App/Info.plist](ios/App/App/Info.plist)의 `GADApplicationIdentifier`에,
      전면 광고 단위 ID `ca-app-pub-5173827714526228/5469889411`를
      [src/lib/ads.js](src/lib/ads.js)의 `INTERSTITIAL_AD_UNIT_ID.ios`에 반영 완료. 앱은 새로 등록된
      상태라 "검토 필요(승인 대기)" 상태이며, 앱스토어 심사 제출 후 며칠 내로 AdMob 쪽 검토도
      자동으로 진행됩니다.
- [ ] **Google Cloud 콘솔(console.cloud.google.com)에서 "Maps SDK for iOS" 활성화 + API 키 발급**
      (배달 추적 화면의 실제 지도는 앱에서만 표시되고, 웹 빌드에는 적용되지 않음).
      - 키를 [ios/App/App/AppDelegate.swift](ios/App/App/AppDelegate.swift)의
        `GMSServices.provideAPIKey("REPLACE_WITH_GOOGLE_MAPS_API_KEY")`에 반영
      - 같은 키를 [src/config/maps.js](src/config/maps.js)의 `GOOGLE_MAPS_API_KEY`에도 반영
      - Android용 키는 별도로 [android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml)의
        `com.google.android.geo.API_KEY`에 반영 (플랫폼마다 별도 등록 필요)
- [ ] `www.음식만안와요.com`에 최신 `dist/`가 배포되어 있고 `/privacy.html`, `/support.html`이
      실제로 열리는지 확인 (App Store Connect가 URL을 검증합니다).

**Firebase 백엔드 관련 (2026-08-27 추가)**: 주문 기록·업적·"내 식당 추가" 기능이 이제 Firebase
(Firestore, 익명 인증)를 사용합니다. Firestore/Auth는 웹 SDK로만 붙어있어서 iOS 쪽 추가 네이티브
설정 없이 이미 동작합니다 (`.env.local`의 웹 앱 설정 그대로 사용). 단, Android에만 붙여둔 Play
Integrity App Check의 iOS 버전(App Attest)은 `GoogleService-Info.plist` + Xcode Capability
설정이 필요해서 Mac 세션으로 미뤄뒀습니다 — 8번 단계(App Store Connect 앱 생성) 전후 여유 있으면
해도 되고, 없으면 나중에 해도 무방합니다 (App Check는 아직 "적용" 안 켜놔서 안 붙여도 앱 동작에
지장 없음). App Privacy 설문은 이제 데이터 수집이 있으므로 아래
[store-assets/app-store-privacy-and-rating.md](store-assets/app-store-privacy-and-rating.md)가
갱신된 내용대로 답해야 합니다 (예전엔 "서버 없음" 기준이었는데 지금은 아님).

---

## Mac 세션 (예상 소요: 약 2.5~3시간)

### 1. 환경 확인 (10분)
```bash
git pull
xcodebuild -version
pod --version || sudo gem install cocoapods
```
Xcode, CocoaPods 둘 다 없다면 이 단계에서 App Store에서 Xcode 설치부터 해야 하며, 그 경우 3시간
예산이 부족할 수 있습니다 (Xcode 설치만 30분~1시간+).

### 2. 의존성 설치 & AdMob ID 반영 (10분)
```bash
npm install
```
- 위 "지금 당장" 항목에서 받아온 iOS AdMob App ID / 광고 단위 ID를 `Info.plist`와 `ads.js`에 채워넣기.

### 3. 웹 빌드 → iOS 동기화 → CocoaPods (10분)
```bash
npm run build
npx cap sync ios
cd ios/App
pod install
cd ../..
```

### 4. Xcode에서 서명 설정 (5분)
```bash
open ios/App/App.xcworkspace
```
- 반드시 `.xcworkspace`를 열 것 (`.xcodeproj` 아님 — CocoaPods 때문에)
- 좌측에서 `App` 타겟 선택 → **Signing & Capabilities**
- **Automatically manage signing** 체크 → Team에서 본인 Apple Developer 계정 선택
- Bundle Identifier가 `com.eggmari.foodneverarrives`인지 확인 (이미 설정됨)

### 5. 시뮬레이터로 한 번 실행 확인 (10분)
- 상단 기기 선택에서 가장 큰 최신 iPhone 시뮬레이터 선택 (예: iPhone 16 Pro Max) → ▶ 실행
- 메뉴 둘러보기 → 장바구니 → 주문 → 배달 추적 → 완료 화면까지 한 번 훑어보고 크래시 없는지 확인
- 광고가 뜨면(30% 확률) 정상 노출되는지 확인 — 안 뜨면 재실행

### 6. App Store 스크린샷 촬영 (20~30분)
같은 시뮬레이터에서 `store-assets/screenshots/`에 있던 5개 화면과 동일한 흐름으로 캡처:
`01-sponsor-popup`, `02-menu-browse`, `03-checkout`, `04-tracking`, `05-complete`
- 각 화면에서 **Cmd+S** → 스크린샷이 Desktop에 저장됨 (기기 실제 해상도 그대로 저장되어
  App Store Connect 요구 규격을 자동으로 만족)
- 6.9"(또는 그 시점 최신 최대) iPhone 시뮬레이터 1세트면 충분한 경우가 많음 — 정확한 필수 규격은
  Apple이 계속 바꾸므로 App Store Connect 업로드 화면에서 실시간으로 확인
- 이 앱은 iPhone 전용으로 설정해뒀으므로 (`TARGETED_DEVICE_FAMILY = 1`) iPad 스크린샷은 불필요

### 7. Archive & 업로드 (10~15분)
- 상단 기기 선택을 **Any iOS Device (arm64)** 로 변경
- **Product → Archive**
- Organizer 창에서 방금 만든 Archive 선택 → **Distribute App → App Store Connect → Upload**
- 나머지는 기본값(자동 서명)으로 진행 → 업로드 완료

업로드된 빌드는 Apple 서버에서 처리(processing)하는 데 보통 15~30분 걸립니다. **8~9단계(App Store
Connect 메타데이터 입력)를 먼저 진행하면서 기다리면 시간이 절약됩니다.**

### 8. App Store Connect에서 앱 생성 & 메타데이터 입력 (20분)
appstoreconnect.apple.com → **My Apps → +→ New App**
- Bundle ID: `com.eggmari.foodneverarrives` (Xcode에서 서명 설정 시 자동 등록됨)
- 기본 언어: 한국어 (필요 시 영어 로케일 추가)
- 카테고리, 이름/서브타이틀/설명/키워드/URL은 아래 파일 그대로 복붙:
  - [store-assets/app-store-listing-ko.md](store-assets/app-store-listing-ko.md)
  - [store-assets/app-store-listing-en.md](store-assets/app-store-listing-en.md) (영어 로케일 추가 시)
- 6번에서 찍은 스크린샷 업로드

### 9. App Privacy & Age Rating 설문 (15분)
[store-assets/app-store-privacy-and-rating.md](store-assets/app-store-privacy-and-rating.md)의
답변을 그대로 따라 입력 (AdMob 광고 식별자 = Tracking 예/Yes, 그 외 수집 없음, 연령 등급 4+).

### 10. 빌드 연결 & 심사 정보 입력 (10분)
- 처리 완료된 빌드(7번)를 버전 페이지의 **Build** 항목에서 선택
- **App Review Information**에 위 파일의 심사 참고사항 문구 붙여넣기 (로그인 없으니 데모 계정 칸은 비움)
- **Export Compliance**: `Info.plist`에 이미 `ITSAppUsesNonExemptEncryption = false`를 넣어뒀으므로
  보통 질문이 자동 스킵되거나 "표준 암호화만 사용" 정도로 간단히 답하면 됨
- **Content Rights**: 제3자 콘텐츠 없음(모두 자체 제작 가상 데이터) 체크

### 11. 출시 방식 선택 & 제출 (5분)
- **Automatically release this version**: 심사 통과 즉시 스토어에 공개
- **Manually release**: 심사 통과 후에도 본인이 버튼을 눌러야 공개 (원치 않는 타이밍에 뜨는 것 방지하고
  싶으면 이 옵션)
- **Submit for Review** 클릭 → 완료. 이후 심사(보통 1~3일)는 자동 진행됩니다.

---

## 참고: 이미 준비되어 실행됨
- `ios/` 플랫폼 추가 완료 (`@capacitor/ios` 설치, `npx cap add ios`)
- 앱 아이콘(1024×1024) · 스플래시 화면 iOS 에셋 자동 생성 완료 (`assets/*.svg` 기반)
- `Info.plist`: `GADApplicationIdentifier`(placeholder), `SKAdNetworkItems`,
  `NSUserTrackingUsageDescription`(ATT 문구), `ITSAppUsesNonExemptEncryption = false` 추가
- `src/lib/ads.js`: 플랫폼별 광고 단위 ID 분기 처리 (기존엔 Android ID 하나만 하드코딩되어 있어서
  iOS 빌드에서 광고가 아예 실패했을 코드였음)
- `public/privacy.html`: "Android 앱엔 광고 없음"이라는 기존 문구가 실제로는 틀렸던 것(AdMob 전면
  광고가 이미 붙어 있었음)을 iOS 포함해서 정확하게 수정
- `public/support.html`: App Store Connect의 필수 항목인 Support URL용 페이지 신규 작성
- iPad 미지원으로 설정 (`TARGETED_DEVICE_FAMILY = "1"`) → iPad용 스크린샷/레이아웃 검증 불필요
- Firebase 백엔드(Firestore + 익명 인증) 연동 완료, Android는 Firebase 등록 + Play Integrity App
  Check(모니터링 모드)까지 완료·실기기 검증됨. "내 식당 추가" 기능에 사진 첨부 + 신고 3회 시
  자동숨김 모더레이션 추가됨
- `public\privacy.html`, `store-assets/*-listing-*.md`, `store-assets/app-store-privacy-and-rating.md`
  모두 새 백엔드 기준으로 갱신 완료 (이름/주소/연락처는 여전히 기기에만 남고, 그 외 주문기록·업적·
  사용자 등록 콘텐츠는 서버에 저장된다는 내용)
