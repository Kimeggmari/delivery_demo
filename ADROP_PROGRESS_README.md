# Adrop 광고 연동 — 진행 상황 인수인계 (2026-11-19 기준)

다른 컴퓨터에서 이어서 작업하기 위한 문서입니다. 이 폴더(`dev` 브랜치)만 받으면 코드 상태는 모두 따라옵니다.
iOS 맥 세션 전용 지시문은 [IOS_ADROP_PROMPT.md](IOS_ADROP_PROMPT.md)에 따로 있습니다.

## 한 줄 요약
- Google AdMob은 **완전히 제거**했고, 광고 플랫폼을 **Adrop(에이드랍, docs.adrop.io)** 으로 바꾸는 중입니다.
- **Android: 유닛 ID 반영·빌드 완료**(기기 실행 확인은 아직). **iOS: 하나도 안 함**(맥북 필요). **백필: Adrop이 발급하는 ID 대기 중.**

## 구조 (하이브리드)
| 슬롯 | 방식 | 코드 |
|---|---|---|
| 배너(홈, 주문대기), 네이티브(주문완료) | 웹뷰 안에서 Adrop **Web SDK** (`@adrop/ads-web-sdk`) | `src/components/AdSlot.jsx`, `src/lib/adrop.js` |
| 하단 팝업, 스플래시 | **네이티브 SDK** + 로컬 Capacitor 플러그인 `AdropNative` | `src/lib/adropNative.js`, `android/.../AdropNativePlugin.java` |

- 설정 파일: `src/config/adUnits.js` (`AD_SLOTS_ENABLED`, `AD_APP_ID`, `UNIT_ID`, 슬롯별 규격)
- 광고가 준비되지 않은 슬롯: **dev 빌드에서만 회색 "AD" 박스**, 릴리스/공개 웹에서는 아무것도 렌더링하지 않음
- `AD_SLOTS_ENABLED = false`로 바꾸면 모든 슬롯(팝업 포함)이 꺼짐
- Android 초기화: `FnaApplication.java` — `adrop_service.json`이 없으면 건너뜀, `production` = 릴리스 빌드(debug는 테스트 광고만)

## 발급된 Android 유닛 (콘솔 기준)
| 슬롯 | 유닛 이름 | 유닛 ID | 규격 | 백필 |
|---|---|---|---|---|
| splash | Android_시작_하단_splash | `01M7PX64ASWYR7RGTXEQSF0YTB` | 360×270 | 미지원 |
| homePopup | Android_홈_하단_popupBottom | `01M7PX8F4CS6VB1M15HSWKJYTC` | 360×240 | 미지원 |
| homeBanner | Android_홈_안내문구하단_banner | `01M7PX9HQFSQ1JFRPQEHB9N2MV` | 320×100 | 처리중 |
| trackingBanner | Android_주문대기_라이더정보하단_banner | `01M7PXA8MT4NYQA8FZT3QTRTRN` | 320×50 | 처리중 |
| completeNative | Android_주문완료_최하단_native | `01M7PXBDDDZQ5P6FE0931QA00C` | 600×314 | 처리중 |

- 시트의 규격(스플래시 320×480, 팝업 320×100, 네이티브 320×50)은 **Adrop 고정 규격에 맞춰 바뀌었습니다.**
- 콘솔에서 유닛 옆에 빨간 아이콘이 보였고 "연결된 광고 상품"이 비어 있었습니다. 광고 상품이 연결돼야 실광고가 나올 가능성이 있습니다(확인 필요).
- **iOS 유닛은 아직 없음** → `UNIT_ID`의 `ios: ""` 자리가 비어 있음.

## 2026-11-19 추가 업데이트
- Adrop이 Android 백필용 `APPLICATION_ID`를 발급함: `ca-app-pub-1007661712122174~4563137827`
- `src/config/adUnits.js`의 `AD_APP_ID.android`에 반영
- 백필 적용 완료: `android/app/build.gradle`에 `io.adrop:adrop-ads-backfill:1.17.0` 추가, `AndroidManifest.xml`에 `com.google.android.gms.ads.APPLICATION_ID`·`com.google.android.gms.ads.INTEGRATION_MANAGER=webview` meta-data 추가, `MainActivity.java`에서 `Adrop.registerWebView(bridge.getWebView())` 호출(`FnaApplication.adropReady`로 가드)
- **에뮬레이터(Pixel 7, API 34)에서 debug APK 실행 확인 완료**: 크래시 없음, 홈 화면 정상 렌더링. logcat에서 GMA(`com.google.android.gms.ads.service.START`) 바인딩 확인됨(APPLICATION_ID/INTEGRATION_MANAGER 적용이 크래시로 이어지지 않음).
- **중요 수정**: `src/config/adUnits.js`의 `AD_APP_ID`(Adrop **Web SDK**용, 배너/네이티브 슬롯에 씀)에 실수로 구글 백필용 `ca-app-pub-...` ID를 넣었었음. 이 둘은 다른 값 — Web SDK의 `appId`는 Adrop 콘솔 자체 App ID. `android/app/src/main/assets/adrop_service.json`의 `app_key`(JWT)를 디코딩해서 실제 값 `01M60HA750030M7WWPGPS2BT6M:01M62N89MMHK3AB92DQBAVR329`을 찾아 반영 → 재빌드 후 **홈 배너 슬롯에 "Adrop Test Ad / Banner 320x100" 테스트 광고가 정상적으로 뜨는 것 확인함(성공)**.
- 하단 팝업(native, `AdropNativePlugin`)은 여전히 `ERROR_CODE_AD_NO_FILL` — 이건 Web SDK appId와 무관하게, 콘솔에서 해당 유닛의 "연결된 광고 상품"이 비어있어서("처리중") 발생하는 것으로 보임. 코드 문제 아니고 Adrop 쪽 계정/상품 연결 대기 상태로 추정.
- **네이티브 스플래시 연동 완료**(`io.adrop.ads.splash.AdropSplashAdActivity`를 런처로, `MainActivity`는 `adrop_splash_ad_next_activity`로): `AndroidManifest.xml`, `res/values/strings.xml`(유닛ID·다음 액티비티·타임아웃), `res/values/styles.xml`·`res/values-v31/styles.xml`(`Theme.App.SplashTheme`, API31+ SplashScreen API), `res/layout/activity_adrop_splash_ad.xml`(콘솔 다운로드 템플릿에 로고·배경색만 우리 브랜드로 수정, `adrop_splash_ad_image` 뷰는 그대로 유지), `res/drawable/splash_logo.png`(앱 아이콘 복사) 추가. 웹 쪽 `SplashScreen.jsx`의 `<AdSlot slot="splash">`는 제거함(중복 방지).
- 에뮬레이터 cold-start(`monkey -c LAUNCHER`)로 확인: `AdropSplashAdActivity` → `MainActivity` 정상 전환, 크래시 없음. 광고 자체는 NO_FILL(해당 유닛도 콘솔 연결 대기 상태로 추정).
- **콘솔의 "광고 노출 미확인" 경고 조사 결과**: 배너/네이티브 포맷 유닛의 "연결하기" 가이드는 전부 **네이티브 Kotlin SDK**(`AdropBanner`, `AdropNativeAdView`) 기준이라, Web SDK로 구현한 홈배너/트래킹배너/완료네이티브에는 해당 사항 없음(코드 추가 불필요). 트래킹/완료 배너가 계속 미확인으로 뜨는 건 그 화면까지 아직 실제로 들어가본 적이 없어서일 가능성이 높음 — 에뮬레이터에서 주문 흐름(담기→주문대기→주문완료)까지 수동으로 타봐야 확인됨 (adb 좌표 클릭으로는 실패, 웹뷰라 접근성 트리에 개별 버튼이 안 잡힘).
- **아직 안 함**: 주문대기/주문완료 화면 실제 진입 확인(수동 필요), 릴리스 빌드(실제 production 모드)에서의 실광고 노출, iOS `GADApplicationIdentifier` 수령 여부 확인

## 지금까지 한 일 (모두 `dev`에 푸시됨)
- AdMob 플러그인·매니페스트 ID·Info.plist `GADApplicationIdentifier`·관련 문구 제거, `src/lib/ads.js` 삭제
- Android: `io.adrop:adrop-ads:1.17.0`, `FnaApplication` 가드 초기화, 팝업 플러그인, pangle maven 저장소
- 광고 슬롯 컴포넌트와 화면 배치(스플래시·홈·주문대기·주문완료), 개인정보 문구를 Adrop 기준으로 변경
- `main` 머지 정리(과거 Adrop 기초 작업과 통합), `adrop_service.json`(Android/iOS)은 이미 저장소에 있음
- Android 유닛 ID 5개 반영, `versionCode 16` / `versionName "1.1.8"`, release AAB 빌드 및 서명 검증 완료
- `app-ads.txt`: `vercel.json`이 `/app-ads.txt`를 `https://adrop.io/app-ads.txt`로 **308 리디렉션**. `main`에도 반영·실제 도메인 동작 확인

## 아직 확인하지 못한 것
- **기기(또는 에뮬레이터)에서 앱 실행 및 팝업 노출** — 가장 먼저 해볼 것 (debug APK 권장)
- 주문대기/주문완료 화면의 슬롯 모양(실제 광고 기준)
- 릴리스 빌드에서 실광고 요청 결과 (유닛이 "처리중"이면 안 뜰 수 있음)
- iOS 전부

## 남은 작업 (순서대로)
1. **Adrop에 회신**: "app-ads.txt를 리디렉션으로 설정했습니다" → **백필용 Android `APPLICATION_ID`, iOS `GADApplicationIdentifier`** 수령
2. 같이 확인할 것(이전 문의 항목): `adrop_service.json`의 `app_key`가 Web SDK `appId`인지, Web SDK의 Capacitor WebView 사용 가능 여부와 도메인/CSP, 백필 네트워크 목록(개인정보 문구용), SKAdNetworkItems 전체 목록, ATT 필요 여부, iOS 유닛 발급
3. App ID 받으면 `src/config/adUnits.js`의 `AD_APP_ID.android`에 입력 → 배너/네이티브 테스트
4. 백필 적용(**ID를 받은 뒤에만**): `android/app/build.gradle`에 `io.adrop:adrop-ads-backfill:1.17.0`, 매니페스트에 `com.google.android.gms.ads.APPLICATION_ID`와 `INTEGRATION_MANAGER=webview`, `Adrop.registerWebView(bridge.getWebView())`
5. Android 네이티브 스플래시(AdropSplashAd, 360×270) 연동 후 웹 스플래시 슬롯 제거
6. **iOS (맥북 필요)**: `IOS_ADROP_PROMPT.md` 사용. iOS 유닛 ID와 `GADApplicationIdentifier`를 미리 받아 두면 좋음
7. 스토어/정책 문구 수정: `IOS_RELEASE_CHECKLIST.md`, `store-assets/app-store-privacy-and-rating.md`(아직 AdMob 기준), Play 데이터 보안 설문, App Store 개인정보 라벨, ATT 처리 결정
8. Play 업로드 전 `versionName`(1.1.8 vs main 과거 1.1.12) 확인

## 절대 하지 말 것
- **AdMob 다시 넣기 금지.**
- **백필(`adrop-ads-backfill`, `adrop-ads-backfill-pod`)을 Adrop이 준 `APPLICATION_ID`/`GADApplicationIdentifier` 없이 추가하지 말 것** — Google Mobile Ads가 같이 링크돼 앱이 시작하자마자 크래시할 수 있음(핵심 `adrop-ads`만으로는 안전).
- `ios/App/CapApp-SPM/Package.swift`는 `npx cap sync`가 덮어쓰므로 수정 금지. iOS의 Adrop 패키지는 Xcode에서 App 타깃에 직접 추가.

## 다른 컴퓨터에서 시작하기
```bash
git clone https://github.com/Kimeggmari/delivery_demo.git && cd delivery_demo
git checkout dev
npm ci
npm run build
npx cap sync android      # iOS는 맥에서 npx cap sync ios
```
- 저장소에 **없는 것**(따로 옮겨야 함): `android/keystore.properties`와 키스토어 파일(release 서명), `google-services.json`(있는 경우), `.env` 류. 없으면 debug 빌드만 가능.
- Android 빌드(Windows): `ANDROID_HOME=C:/Android/Sdk` 설정 후 `android/`에서 `./gradlew.bat :app:assembleDebug` (APK) 또는 `:app:bundleRelease` (AAB). 산출물 `android/app/build/outputs/…`는 git에 올라가지 않음.
- Vite 미리보기 서버가 떠 있으면 `npx cap sync`/gradle 전에 먼저 종료(Windows 파일 잠금).
- 개발 사이트(`VITE_SITE_MODE=dev`)는 접속 암호가 있고, 공개 사이트는 서비스 종료 페이지를 보여 줌. 앱(네이티브)은 항상 전체 기능. 자세한 건 `DEV_SITE_SETUP.md`.

## 브랜치 상태
- 작업 브랜치 `dev`(원격과 동일). `main`에는 `app-ads.txt` 리디렉션 커밋(`ff17f1a`)만 선별 반영됨 — 사이트는 `main` 기준 Vercel 배포로 보임.
- `dev`에는 광고 외에 아직 `main`에 없는 변경도 있음(관리자 권한/기기 ID 표시/`firestore.rules`/Analytics 화면 추적 등). **dev 전체를 `main`에 머지하기 전 범위 확인 필요.** `firestore.rules`는 푸시만으로 배포되지 않고 `firebase deploy`가 따로 필요.
- 커밋하지 않은 파일: `android_logcat.txt`, 광고 소개서 PDF(의도적으로 추적 안 함).
