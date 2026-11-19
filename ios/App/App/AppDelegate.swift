import UIKit
import Capacitor
import AdropAds

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        // Adrop: Debug 빌드는 테스트 모드(false), Release(App Store 배포) 빌드는 production(true)
        #if DEBUG
        Adrop.initialize(production: false, targetCountries: [])
        #else
        Adrop.initialize(production: true, targetCountries: [])
        #endif
        // The app UI is light-only, so keep ads light even in system dark mode
        // (Adrop recommends .auto only for apps that follow the system theme).
        Adrop.setTheme(.light)

        showSplashAd()
        return true
    }

    // MARK: - Adrop splash ad

    #if DEBUG
    private static let splashAdUnitId = "PUBLIC_TEST_UNIT_ID_SPLASH" // Debug test splash campaign
    #else
    private static let splashAdUnitId = "01M7RV0S5BSE1D24QPV0BSB3TE" // iOS_시작_하단_splash
    #endif
    private var mainViewController: UIViewController?
    private weak var splashContainer: SplashContainerViewController?

    /// Puts Adrop's splash (logo on top, 360×270 ad at the bottom) in front of
    /// the Capacitor view controller. The web view starts loading behind it
    /// right away so the app is ready by the time the ad closes.
    private func showSplashAd() {
        guard let window = window, let main = window.rootViewController else { return }
        main.loadViewIfNeeded()
        mainViewController = main

        let bgColor = UIColor(red: 1.0, green: 0.969, blue: 0.929, alpha: 1) // #fff7ed
        let splash = AdropSplashAdViewController(unitId: Self.splashAdUnitId)
        splash.logoImage = UIImage(named: "SplashLogo")
        splash.backgroundColor = bgColor
        splash.mainViewController = main
        splash.delegate = self

        // Host Adrop's splash VC inside a safe-area-aware container so the
        // bottom 360×270 ad creative sits above the iOS Home Indicator with
        // rounded corners matching the app's 20pt card language.
        let container = SplashContainerViewController(splash: splash, backgroundColor: bgColor)
        splashContainer = container
        window.rootViewController = container
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Adrop ad deep links first; anything else goes to Capacitor as before.
        if Adrop.handleDeepLink(url: url) {
            return true
        }
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

extension AppDelegate: AdropSplashAdDelegate {
    func onAdReceived(_ ad: AdropSplashAd) {
        DispatchQueue.main.async { [weak self] in
            self?.splashContainer?.roundAdViews()
        }
    }

    func onAdImpression(_ ad: AdropSplashAd) {
        DispatchQueue.main.async { [weak self] in
            self?.splashContainer?.roundAdViews()
        }
    }

    #if DEBUG
    func onAdFailedToReceive(_ ad: AdropSplashAd, _ errorCode: AdropErrorCode) {
        NSLog("[AdropPlugin] splash failed %@", errorCode.keyString)
    }
    #endif

    func onAdClose(_ ad: AdropSplashAd, impressed: Bool) {
        // The SDK swaps in mainViewController itself; make sure the app ends
        // up on the Capacitor screen even if it didn't (e.g. ad load failure).
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let window = self.window, let main = self.mainViewController else { return }
            if window.rootViewController !== main && main.view.window == nil {
                window.rootViewController = main
            }
        }
    }
}

private final class SplashContainerViewController: UIViewController {
    private let splash: AdropSplashAdViewController
    private let bgColor: UIColor

    init(splash: AdropSplashAdViewController, backgroundColor: UIColor) {
        self.splash = splash
        self.bgColor = backgroundColor
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError() }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = bgColor
        addChild(splash)
        splash.view.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(splash.view)
        NSLayoutConstraint.activate([
            splash.view.topAnchor.constraint(equalTo: view.topAnchor),
            splash.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            splash.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            splash.view.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -16),
        ])
        splash.didMove(toParent: self)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        roundAdViews()
    }

    func roundAdViews() {
        let midY = splash.view.bounds.midY
        guard midY > 0 else { return }
        applyRounding(in: splash.view, midY: midY)
    }

    private func applyRounding(in root: UIView, midY: CGFloat) {
        for subview in root.subviews {
            let frameInSplash = subview.convert(subview.bounds, to: splash.view)
            if frameInSplash.minY >= midY && frameInSplash.width >= 200 && frameInSplash.height >= 150 {
                subview.layer.cornerRadius = 20
                subview.layer.cornerCurve = .continuous
                subview.clipsToBounds = true
            }
            applyRounding(in: subview, midY: midY)
        }
    }
}
