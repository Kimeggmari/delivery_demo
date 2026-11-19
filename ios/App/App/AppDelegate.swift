import UIKit
import Capacitor
import GoogleMaps
import AdropAds

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        GMSServices.provideAPIKey("AIzaSyCD1SQFSKxcWoWQnlL_pf-DNACXTbIS0Fs")

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

    private static let splashAdUnitId = "01M7RV0S5BSE1D24QPV0BSB3TE" // iOS_시작_하단_splash
    private var mainViewController: UIViewController?

    /// Puts Adrop's splash (logo on top, 360×270 ad at the bottom) in front of
    /// the Capacitor view controller. The web view starts loading behind it
    /// right away so the app is ready by the time the ad closes.
    private func showSplashAd() {
        guard let window = window, let main = window.rootViewController else { return }
        main.loadViewIfNeeded()
        mainViewController = main

        let splash = AdropSplashAdViewController(unitId: Self.splashAdUnitId)
        splash.logoImage = UIImage(named: "SplashLogo")
        splash.backgroundColor = UIColor(red: 1.0, green: 0.925, blue: 0.863, alpha: 1)
        splash.mainViewController = main
        splash.delegate = self
        window.rootViewController = splash
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
