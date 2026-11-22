import UIKit
import Capacitor

/// Main Capacitor view controller; registers app-local native plugins
/// (Adrop native ads + the system tab bar bridge).
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AdropPlugin())
        bridge?.registerPluginInstance(LiquidGlassPlugin())
    }
}

// MARK: - System tab bar shell
//
// The app's navigation uses the system `UITabBarController` instead of a
// custom bar drawn over the web view. Apple's "Preparing your app for iPhone
// Duo" asks apps to use the bars that system containers provide rather than
// custom `UITabBar`/`UIToolbar` views, so the system can:
// - render them in Liquid Glass,
// - present them horizontally at the bottom, or as the vertical bar on the
//   side of iPhone Duo (outer display, and inner display in landscape), next
//   to the camera and status bar,
// - add the matching safe-area insets, which the web content reads through
//   `env(safe-area-inset-*)`.
//
// The single Capacitor web view lives in whichever tab is selected; the web
// app still renders each tab's page, and the plugin below keeps both sides in
// sync.

@available(iOS 26.0, *)
final class AppTabBarController: UITabBarController, UITabBarControllerDelegate {
    static let tabKeys = ["order", "search", "favorites", "my"]
    private static let symbols = ["house", "magnifyingglass", "heart", "wonsign.circle"]
    private static let defaultTitles = ["홈", "검색", "찜", "마이 절약"]

    /// The shell hosting the web app, if any (there is one window scene).
    static weak var current: AppTabBarController?

    let bridgeViewController: UIViewController
    private var hosts: [String: TabHostViewController] = [:]
    private let cartView = CartAccessoryView()

    var onTabSelected: ((String) -> Void)?
    var onCartTapped: (() -> Void)? {
        didSet { cartView.onTap = onCartTapped }
    }

    init(bridgeViewController: UIViewController) {
        self.bridgeViewController = bridgeViewController
        super.init(nibName: nil, bundle: nil)
        Self.current = self
        delegate = self
        tabs = Self.tabKeys.enumerated().map { i, key in
            UITab(
                title: Self.defaultTitles[i],
                image: UIImage(systemName: Self.symbols[i]),
                identifier: key
            ) { [unowned self] _ in self.host(for: key) }
        }
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError() }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 1.0, green: 0.969, blue: 0.929, alpha: 1) // #fff7ed
        // Brand accent for the selected tab and accessory controls.
        view.tintColor = UIColor(red: 0.918, green: 0.345, blue: 0.047, alpha: 1) // #ea580c
        // Keep the bar hidden until the web app reports a screen that shows it,
        // so the launch splash and first-run intro appear without it.
        setTabBarHidden(true, animated: false)
        // Start loading the web app right away (it runs behind the splash ad).
        host(for: Self.tabKeys[0]).adoptBridge()
    }

    private func host(for key: String) -> TabHostViewController {
        if let existing = hosts[key] { return existing }
        let host = TabHostViewController(bridgeViewController: bridgeViewController)
        hosts[key] = host
        return host
    }

    // Only user taps reach this delegate method; selections made from the web
    // app (via the plugin) don't echo back.
    func tabBarController(_ tabBarController: UITabBarController, didSelectTab selectedTab: UITab, previousTab: UITab?) {
        onTabSelected?(selectedTab.identifier)
    }

    func apply(_ state: ChromeState) {
        for (i, tab) in tabs.enumerated() where i < state.labels.count && tab.title != state.labels[i] {
            tab.title = state.labels[i]
        }
        if let tab = tabs.first(where: { $0.identifier == state.activeTab }), selectedTab !== tab {
            selectedTab = tab
        }
        setTabBarHidden(!state.visible, animated: true)

        let showCart = state.visible && state.cartCount > 0
        if showCart {
            cartView.update(count: state.cartCount, title: state.cartLabel, total: state.cartTotal, active: state.cartActive)
            if bottomAccessory == nil {
                setBottomAccessory(UITabAccessory(contentView: cartView), animated: true)
            }
        } else if bottomAccessory != nil {
            setBottomAccessory(nil, animated: true)
        }
    }
}

/// Container for one tab. The shared web view moves into whichever tab host
/// is about to appear, filling it edge to edge; the web content keeps clear of
/// the bars and hardware through the safe area the system gives this host.
@available(iOS 26.0, *)
private final class TabHostViewController: UIViewController {
    private let bridgeViewController: UIViewController

    init(bridgeViewController: UIViewController) {
        self.bridgeViewController = bridgeViewController
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError() }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        adoptBridge()
    }

    func adoptBridge() {
        let bridge = bridgeViewController
        guard bridge.parent !== self else { return }
        if bridge.parent != nil {
            bridge.willMove(toParent: nil)
            bridge.view.removeFromSuperview()
            bridge.removeFromParent()
        }
        addChild(bridge)
        bridge.view.frame = view.bounds
        bridge.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(bridge.view)
        bridge.didMove(toParent: self)
    }
}

/// Content of the tab bar's bottom accessory: the cart summary. The system
/// supplies the Liquid Glass container and places it with the tab bar.
@available(iOS 26.0, *)
private final class CartAccessoryView: UIView {
    var onTap: (() -> Void)?

    private let icon = UIImageView(image: UIImage(systemName: "cart.fill"))
    private let countLabel = UILabel()
    private let titleLabel = UILabel()
    private let totalLabel = UILabel()

    override init(frame: CGRect) {
        super.init(frame: frame)
        icon.tintColor = UIColor(red: 0.918, green: 0.345, blue: 0.047, alpha: 1)
        icon.contentMode = .scaleAspectFit
        countLabel.font = .systemFont(ofSize: 13, weight: .heavy)
        countLabel.textColor = icon.tintColor
        titleLabel.font = .systemFont(ofSize: 15, weight: .semibold)
        titleLabel.textColor = .label
        totalLabel.font = .monospacedDigitSystemFont(ofSize: 15, weight: .bold)
        totalLabel.textColor = .label
        totalLabel.setContentCompressionResistancePriority(.required, for: .horizontal)

        let leading = UIStackView(arrangedSubviews: [icon, countLabel, titleLabel])
        leading.spacing = 6
        leading.alignment = .center
        let row = UIStackView(arrangedSubviews: [leading, UIView(), totalLabel])
        row.alignment = .center
        row.spacing = 8
        row.translatesAutoresizingMaskIntoConstraints = false
        addSubview(row)
        NSLayoutConstraint.activate([
            icon.widthAnchor.constraint(equalToConstant: 20),
            row.leadingAnchor.constraint(equalTo: layoutMarginsGuide.leadingAnchor),
            row.trailingAnchor.constraint(equalTo: layoutMarginsGuide.trailingAnchor),
            row.centerYAnchor.constraint(equalTo: centerYAnchor),
        ])

        isAccessibilityElement = true
        accessibilityTraits = .button
        addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(handleTap)))
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError() }

    func update(count: Int, title: String, total: String, active: Bool) {
        countLabel.text = "\(count)"
        titleLabel.text = title
        totalLabel.text = total
        accessibilityLabel = "\(title), \(count), \(total)"
        accessibilityTraits = active ? [.button, .selected] : .button
    }

    @objc private func handleTap() {
        UISelectionFeedbackGenerator().selectionChanged()
        onTap?()
    }
}

struct ChromeState {
    var visible: Bool
    var activeTab: String     // "order" | "search" | "favorites" | "my" | other (no tab change)
    var labels: [String]
    var cartCount: Int
    var cartLabel: String
    var cartTotal: String
    var cartActive: Bool
}

// MARK: - Plugin bridging the web app to the system tab bar

@objc(LiquidGlassPlugin)
public class LiquidGlassPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LiquidGlassPlugin"
    public let jsName = "LiquidGlass"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateState", returnType: CAPPluginReturnPromise),
    ]

    @available(iOS 26.0, *)
    private func tabController() -> AppTabBarController? {
        AppTabBarController.current
    }

    /// True when the web view is hosted in the system tab bar shell, so the
    /// web app must not draw its own bottom tab bar.
    @objc func isAvailable(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            if #available(iOS 26.0, *), self?.tabController() != nil {
                call.resolve(["available": true])
            } else {
                call.resolve(["available": false])
            }
        }
    }

    @objc func updateState(_ call: CAPPluginCall) {
        guard #available(iOS 26.0, *) else {
            call.resolve()
            return
        }
        let state = ChromeState(
            visible: call.getBool("visible") ?? false,
            activeTab: call.getString("activeTab") ?? "order",
            labels: (call.getArray("labels") as? [String]) ?? [],
            cartCount: call.getInt("cartCount") ?? 0,
            cartLabel: call.getString("cartLabel") ?? "장바구니 보기",
            cartTotal: call.getString("cartTotal") ?? "",
            cartActive: call.getBool("cartActive") ?? false
        )
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let tabs = self.tabController() else {
                call.resolve()
                return
            }
            if tabs.onTabSelected == nil {
                tabs.onTabSelected = { [weak self] tab in
                    self?.notifyListeners("tabSelected", data: ["tab": tab])
                }
                tabs.onCartTapped = { [weak self] in
                    self?.notifyListeners("cartTapped", data: [:])
                }
            }
            tabs.apply(state)
            call.resolve()
        }
    }
}
