# iOS Adrop 연동 — 맥북 1시간 세션용 프롬프트

맥북에서 `git checkout dev && git pull` 후, 이 폴더에서 Claude Code를 열고 아래 **"프롬프트"** 블록 전체를 붙여 넣으세요.
(Windows에서 할 수 있는 건 다 끝내 뒀고, 이 문서는 "Mac + Xcode가 있어야만 되는 일"만 남긴 것입니다.)

## 맥 빌리기 전에 (Windows에서, 5분)
- [ ] Apple Developer 계정과 Xcode 서명 팀 준비 (실기기/시뮬레이터 실행에 필요)
- [ ] Adrop 답장이 왔으면 **유닛 ID**를 `src/config/adUnits.js`의 `UNIT_ID`에 먼저 채워 커밋·푸시 (없어도 진행 가능 — 아래 "테스트 방법" 참고)
- [ ] 맥에 Xcode 최신 안정 버전, Node 설치 확인 (Xcode 설치부터 하면 1시간이 모자랍니다)

## 시간 배분 (60분)
| 단계 | 시간 |
|---|---|
| 1. 환경·동기화 | 10분 |
| 2. SPM 패키지 추가 (Xcode UI) | 5분 |
| 3. AppDelegate 초기화 + 플러그인 작성·등록 | 20분 |
| 4. 시뮬레이터/실기기 테스트 | 15분 |
| 5. 정리·커밋 | 10분 |
스플래시 네이티브 연동은 **시간이 남을 때만**(아래 6번).

---

## 프롬프트 (여기부터 복사)

```
너는 이 저장소(React+Vite를 Capacitor 8로 감싼 앱 "음식만안와요", 번들 ID com.eggmari.foodneverarrives)에서
iOS에 Adrop 광고 SDK를 연동하는 작업을 한다. 나는 맥북을 1시간만 빌렸으니 시간 안에 끝내는 것이 중요하다.
막히면 5분 이상 파고들지 말고 이유를 기록하고 다음 단계로 넘어가라. 시작 전에 아래 "현재 상태"를 직접 확인해라.

## 현재 상태 (dev 브랜치, 커밋 dfa8701 이후)
- Google AdMob은 완전히 제거됨(JS/Android/iOS). 절대 다시 넣지 말 것.
- 광고 슬롯 설계(이미 구현):
  - 배너·네이티브: 웹뷰 안에서 Adrop **Web SDK**(@adrop/ads-web-sdk)로 렌더. 코드: src/components/AdSlot.jsx, src/lib/adrop.js
  - 팝업(popupBottom)·스플래시: **네이티브 SDK**, 로컬 Capacitor 플러그인 "AdropNative"로 JS에서 호출. 코드: src/lib/adropNative.js
  - 설정: src/config/adUnits.js (AD_APP_ID, UNIT_ID가 비어 있으면 회색 "AD" 플레이스홀더만 보임)
- Android 참고 구현(똑같이 iOS로 옮겨라):
  - android/app/src/main/java/com/eggmari/foodneverarrives/FnaApplication.java  (adrop_service.json 없으면 초기화 건너뜀, production = 릴리스 빌드)
  - .../AdropNativePlugin.java  (showPopup({unitId}): unitId 없으면 reject, 초기화 안 됐으면 reject, 로드되면 show 후 resolve, 실패하면 reject)
  - .../MainActivity.java  (registerPlugin)
- iOS 프로젝트: ios/App (Capacitor 8, **SPM 기반, Podfile 없음**, iOS 15+). ios/App/App/adrop_service.json 은 이미 있고 project.pbxproj의
  Resources에 등록돼 있다 — Copy Bundle Resources에 들어 있는지만 확인.
- ios/App/CapApp-SPM/Package.swift 는 `npx cap sync`가 **덮어쓰므로 절대 수정하지 마라.** Adrop 패키지는 App 타깃에 직접 추가한다.
- ios/App/App/Info.plist: GADApplicationIdentifier는 의도적으로 삭제됨. SKAdNetworkItems(cstr6suwn9)와 NSUserTrackingUsageDescription은 남아 있음.

## 반드시 지킬 것
- 백필(adrop-ads-backfill-pod), GADApplicationIdentifier, GADIntegrationManager, Adrop.registerWebView는 **지금 넣지 마라.**
  Adrop이 발급하는 GADApplicationIdentifier 없이 Google Mobile Ads가 링크되면 앱이 시작하자마자 크래시할 수 있다. (백필은 Adrop 답변 후 별도 작업)
- 시크릿/키를 새로 만들거나 출력하지 마라. 커밋은 dev에만 하고, **푸시는 나에게 물어본 뒤에.** main은 건드리지 마라. 버전(MARKETING_VERSION 등)은 바꾸지 마라.
- Xcode 서명 팀 선택은 내가 한다. 필요하면 멈추고 알려줘라.
- 막힌 부분은 억지로 우회하지 말고, 마지막 보고에 "못 한 것 + 이유"로 적어라.

## 작업

### 1. 환경·동기화 (10분)
git checkout dev && git pull; xcodebuild -version; npm ci; npm run build; npx cap sync ios.
(ios/App/CapApp-SPM/Package.swift가 바뀌어도 수정하지 말고 그대로 둔다.)

### 2. Adrop SPM 패키지 추가 (5분)
- 가능하면 Xcode UI로 추가한다: App 프로젝트 > Package Dependencies > `https://github.com/OpenRhapsody/adrop-ads-pod`,
  규칙은 "Up to Next Minor Version 1.17.0"(Android와 맞춤), 링크 대상은 **App 타깃**. (project.pbxproj를 손으로 고치다 깨뜨리지 마라 — 꼭 필요할 때만, 고친 뒤 즉시 빌드로 검증)
- 패키지가 받아지면 SourcePackages/checkouts/adrop-ads-pod/Package.swift 에서 **라이브러리(product) 이름과 import할 모듈 이름**을 확인해라.
  (공식 문서에는 이름이 없다.)
- 공식 문서와 실제 API가 다를 수 있으니 컴파일러/자동완성을 기준으로 맞춰라: https://docs.adrop.io/ko/sdk/ios/overview.md , popup.md , reference.md

### 3. 네이티브 코드 (20분)
a) AppDelegate.swift 의 didFinishLaunchingWithOptions 에서 초기화 (Android의 FnaApplication과 동일한 의미):
   - Bundle.main.url(forResource: "adrop_service", withExtension: "json") 가 없으면 건너뜀(로그만)
   - `Adrop.initialize(production: <릴리스면 true, DEBUG면 false>, useInAppBrowser: false, targetCountries: [])` 후 `Adrop.setTheme(.auto)`
     (production=false면 테스트 광고만 나오므로 #if DEBUG 로 자동 전환. 릴리스에서 false로 나가면 광고가 안 뜬다.)
   - 성공하면 AdropNativePlugin.adropReady = true
   - `application(_:open:options:)` 에서 Adrop.handleDeepLink(url:) 도 호출하되, 기존 `ApplicationDelegateProxy` 호출/반환은 유지
b) ios/App/App/AdropNativePlugin.swift 새로 작성 (CAPPlugin + CAPBridgedPlugin, jsName = "AdropNative"):
   - 메서드 `showPopup(call)` : call.getString("unitId") 없으면 reject / adropReady 아니면 reject /
     `AdropPopupAd(unitId:)` 생성, `delegate` 설정, `load()`. 델리게이트 `onAdReceived` 에서
     `show(fromRootViewController: bridge?.viewController)` 후 call.resolve(), `onAdFailedToReceive` 에서 call.reject(String(describing: errorCode)).
     (이미 떠 있는 팝업이 있으면 정리 후 새로 생성. 필요한 건 이 한 메서드뿐이다.)
   - JS 쪽은 이미 작성돼 있다 (src/lib/adropNative.js: registerPlugin("AdropNative"), showPopup({unitId})). 이름을 정확히 맞춰라.
c) 플러그인 등록 + 새 Swift 파일을 **App 타깃에 포함**:
   - ios/App/App/ViewController.swift 를 만들어 `class ViewController: CAPBridgeViewController` 의 `capacitorDidLoad()` 에서
     `bridge?.registerPluginInstance(AdropNativePlugin())`
   - Main.storyboard 의 viewController customClass 를 "ViewController", customModule 을 "App" 으로 변경
     (현재는 customClass="CAPBridgeViewController" customModule="Capacitor")
   - 새 .swift 파일들이 project.pbxproj 의 App 타깃 Sources에 들어갔는지 확인 (Xcode에서 Add Files, Target 체크)
d) Info.plist: UILaunchStoryboardName 이 LaunchScreen 인지 확인만. 다른 키는 추가하지 마라.
e) ATT: AdMob 제거로 지금은 ATT 권한 팝업을 띄우는 코드가 앱에 **없다**. Adrop 문서는 ATT를 언급하지 않는다.
   백필 도입 전까지는 아무것도 추가하지 말고, 최종 보고에 "ATT 처리 결정 필요"로만 적어라.

### 4. 테스트 (15분)
- 먼저 시뮬레이터, 가능하면 실기기에서 빌드·실행. **json이 있는 상태에서 앱이 크래시 없이 뜨는지**가 최우선.
- 팝업 확인용으로 임시로 src/config/adUnits.js 의 `UNIT_ID.homePopup.ios` 를 `"PUBLIC_TEST_UNIT_ID_POPUP_BOTTOM"` 로 바꾸고
  `npm run build && npx cap sync ios` 후 실행 → 홈 화면에서 하단 팝업이 뜨는지, 닫기/"오늘 하루 보지 않기"가 동작하는지 확인.
  (테스트 ID는 vite dev 서버에서만 자동 적용되므로, 네이티브 번들 빌드에서는 이렇게 직접 넣어야 한다.) **확인 후 반드시 원래대로 되돌려라(커밋 금지).**
- 배너/네이티브(Web SDK)는 Adrop에서 appId 확인 답변이 올 때까지 테스트하지 않는다. 슬롯이 회색 "AD" 박스로 보이면 정상이다.
- Xcode 빌드 경고/에러, Xcode 콘솔의 Adrop 로그를 요약해서 보고해라.

### 5. 정리 (10분)
- 변경 파일 목록과 `git diff --stat` 확인, 불필요한 파일(DerivedData, xcuserdata, 임시 테스트 ID) 제외하고 dev에 커밋.
- 커밋 메시지 끝에 공동 작성자 줄을 붙여라(프로젝트 관례). 푸시는 나에게 물어보고.
- 아래를 **보고**해라: 한 일 / 못 한 일(이유) / 다음에 필요한 일.
  다음에 필요한 일 후보: 백필(adrop-ads-backfill-pod + GADApplicationIdentifier + GADIntegrationManager=webview + Adrop.registerWebView(WKWebView)),
  SKAdNetworkItems 전체 목록(Adrop에서 받아야 함), ATT 처리 결정, App Store 개인정보 라벨/심사 문구의 AdMob 서술 수정
  (store-assets/app-store-privacy-and-rating.md, IOS_RELEASE_CHECKLIST.md 에 아직 AdMob 기준 내용이 남아 있음).

### 6. (시간이 남을 때만) 네이티브 스플래시
- 유닛 ID와 json이 모두 있을 때만 진행. 없으면 건너뛰고 보고에만 적어라.
- AdropSplashAdViewController(unitId:) 를 window 루트로 두고 `mainViewController` 에 기존 storyboard 초기 VC를 넘기는 방식.
  유닛 ID가 비어 있으면 기존 흐름 그대로(조건부). 실패/타임아웃이어도 메인 화면으로 넘어가야 한다(onAdClose).
- 광고 영역은 360x270pt, 하단 배치. 이 작업을 하면 웹의 SplashScreen 광고 슬롯 제거도 필요하다(별도로 알려줘라).
- 앱 시작 흐름을 건드리는 작업이라, 안 되면 즉시 원복하고 보고만 해라.
```

---

## 맥 세션 이후 (Windows에서)
- 결과 보고를 보고 남은 항목 정리: Adrop 답변(유닛 ID·백필용 App ID·SKAdNetwork 목록) 반영
- 개인정보처리방침/스토어 문구는 이미 Adrop 기준으로 바꿨음. App Store 개인정보 라벨은 맥 세션 보고의 ATT 결정에 따라 수정
