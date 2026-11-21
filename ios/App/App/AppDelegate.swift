import UIKit
import Capacitor
import AdropAds

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Adrop: Debug 빌드는 테스트 모드(false), Release(App Store 배포) 빌드는 production(true)
        #if DEBUG
        Adrop.initialize(production: false, targetCountries: [])
        #else
        Adrop.initialize(production: true, targetCountries: [])
        #endif
        // The app UI is light-only, so keep ads light even in system dark mode.
        Adrop.setTheme(.light)
        return true
    }

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        if Adrop.handleDeepLink(url: url) {
            return true
        }
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}

// MARK: - UISceneDelegate (required by iOS 27+ SDK & foldable iPhone Duo)

class SceneDelegate: UIResponder, UIWindowSceneDelegate, AdropSplashAdDelegate {

    var window: UIWindow?

    #if DEBUG
    private static let splashAdUnitId = "PUBLIC_TEST_UNIT_ID_SPLASH" // Debug test splash campaign
    #else
    private static let splashAdUnitId = "01M7RV0S5BSE1D24QPV0BSB3TE" // iOS_시작_하단_splash
    #endif

    private var mainViewController: UIViewController?
    private weak var splashContainer: SplashContainerViewController?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        if window == nil {
            let win = UIWindow(windowScene: windowScene)
            let storyboard = UIStoryboard(name: "Main", bundle: nil)
            win.rootViewController = storyboard.instantiateInitialViewController()
            self.window = win
            win.makeKeyAndVisible()
        }
        // iOS 26+: host the web app in the system tab bar so the system
        // presents the bars (bottom, or the vertical side bar on iPhone Duo).
        // The window usually comes from UISceneStoryboardFile with the
        // Capacitor view controller as its root, so wrap that root here.
        if #available(iOS 26.0, *), let win = window, let root = win.rootViewController,
           !(root is AppTabBarController) {
            win.rootViewController = AppTabBarController(bridgeViewController: root)
        }
        showSplashAd()
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let context = URLContexts.first else { return }
        let url = context.url
        if Adrop.handleDeepLink(url: url) {
            return
        }
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: url, options: [:])
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }

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

        let container = SplashContainerViewController(splash: splash, backgroundColor: bgColor)
        splashContainer = container
        window.rootViewController = container
        window.makeKeyAndVisible()
    }

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
