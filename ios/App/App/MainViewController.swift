import UIKit
import Capacitor

/// Main Capacitor view controller; registers app-local native plugins
/// (Adrop native ads + iOS 26/27 native Metal Liquid Glass chrome).
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AdropPlugin())
        bridge?.registerPluginInstance(LiquidGlassPlugin())
    }
}

// MARK: - Native iOS 26/27 Liquid Glass Plugin

@objc(LiquidGlassPlugin)
public class LiquidGlassPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LiquidGlassPlugin"
    public let jsName = "LiquidGlass"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateState", returnType: CAPPluginReturnPromise),
    ]

    private var overlayController: AnyObject?

    @objc func isAvailable(_ call: CAPPluginCall) {
        if #available(iOS 26.0, *) {
            call.resolve(["available": true])
        } else {
            call.resolve(["available": false])
        }
    }

    @objc func updateState(_ call: CAPPluginCall) {
        guard #available(iOS 26.0, *) else {
            call.resolve()
            return
        }
        let state = LiquidGlassChromeState(
            visible: call.getBool("visible") ?? false,
            mode: call.getString("mode") ?? "bottom",
            edge: call.getString("edge") ?? "right",
            showTabs: call.getBool("showTabs") ?? true,
            activeTab: call.getString("activeTab") ?? "order",
            labels: (call.getArray("labels") as? [String]) ?? ["홈", "검색", "찜", "마이 절약"],
            cartCount: call.getInt("cartCount") ?? 0,
            cartLabel: call.getString("cartLabel") ?? "장바구니 보기",
            cartTotal: call.getString("cartTotal") ?? "",
            cartActive: call.getBool("cartActive") ?? false
        )

        DispatchQueue.main.async { [weak self] in
            guard let self = self,
                  let hostView = self.bridge?.viewController?.view,
                  let webView = self.bridge?.webView else {
                call.resolve()
                return
            }
            let overlay: LiquidGlassOverlayView
            if let existing = self.overlayController as? LiquidGlassOverlayView {
                overlay = existing
            } else {
                overlay = LiquidGlassOverlayView(scrollView: webView.scrollView)
                overlay.translatesAutoresizingMaskIntoConstraints = false
                overlay.onTabSelected = { [weak self] tab in
                    self?.notifyListeners("tabSelected", data: ["tab": tab])
                }
                overlay.onCartTapped = { [weak self] in
                    self?.notifyListeners("cartTapped", data: [:])
                }
                overlay.onSettingsTapped = { [weak self] in
                    self?.notifyListeners("settingsTapped", data: [:])
                }
                hostView.addSubview(overlay)
                NSLayoutConstraint.activate([
                    overlay.topAnchor.constraint(equalTo: hostView.topAnchor),
                    overlay.leadingAnchor.constraint(equalTo: hostView.leadingAnchor),
                    overlay.trailingAnchor.constraint(equalTo: hostView.trailingAnchor),
                    overlay.bottomAnchor.constraint(equalTo: hostView.bottomAnchor),
                ])
                self.overlayController = overlay
            }
            overlay.apply(state)
            call.resolve()
        }
    }
}

private struct LiquidGlassChromeState: Equatable {
    var visible: Bool
    var mode: String          // "bottom" | "rail" (unfolded Duo, left) | "edgeRail" (folded Duo cover screen)
    var edge: String          // "edgeRail" side: "right" | "left"
    var showTabs: Bool
    var activeTab: String     // "order" | "search" | "favorites" | "my"
    var labels: [String]
    var cartCount: Int
    var cartLabel: String
    var cartTotal: String
    var cartActive: Bool
}

// MARK: - Native UITabBar + UIGlassEffect + UIButton.Configuration.glass() Chrome (iOS 26+)

@available(iOS 26.0, *)
private final class LiquidGlassOverlayView: UIView, UITabBarDelegate, UIGestureRecognizerDelegate {
    private static let tabKeys = ["order", "search", "favorites", "my"]
    private static let tabSymbols = ["house", "magnifyingglass", "heart", "wonsign.circle"]
    private static let tabSymbolsSelected = ["house.fill", "magnifyingglass", "heart.fill", "wonsign.circle.fill"]
    private static let brandOrange = UIColor(red: 0.976, green: 0.451, blue: 0.086, alpha: 1.0)
    private static let brandDark = UIColor(red: 0.918, green: 0.345, blue: 0.047, alpha: 1.0)
    private static let inkNeutral = UIColor(red: 0.110, green: 0.098, blue: 0.090, alpha: 0.72)

    var onTabSelected: ((String) -> Void)?
    var onCartTapped: (() -> Void)?
    var onSettingsTapped: (() -> Void)?

    private weak var scrollView: UIScrollView?
    private var currentState: LiquidGlassChromeState?
    private var selectedIndex: Int = 0

    // MARK: Bottom Mode (iPhone & Folded iPhone Duo)
    // Uses genuine first-party UITabBar (for Apple's native optical magnifying droplet lens &
    // Metal Liquid Glass refraction) paired with a native .prominentGlass() Cart button.
    private let bottomWrapper = UIView()
    private let bottomTabBar = UITabBar()
    private var bottomTabItems: [UITabBarItem] = []
    private let bottomCartButton = UIButton(type: .system)
    private let bottomCartCountLabel = UILabel()
    private let bottomCartTitleLabel = UILabel()
    private let bottomCartTotalLabel = UILabel()

    // MARK: Rail Mode (Unfolded iPhone Duo)
    // Uses UIGlassContainerEffect unifying a concentric capsule nav pill (with clean resting
    // platter + touch/drag clear optical Liquid Glass droplet lens) and native .glass() buttons.
    private let railContainer: UIVisualEffectView
    private let railNavPill: UIVisualEffectView
    private let railRestPlatter = UIView()
    private let railActiveDroplet: UIVisualEffectView
    private var railTabViews: [GlassTabSlotView] = []
    private let railCartButton = UIButton(type: .system)
    private let railCartBadge = UILabel()
    private let railSettingsButton = UIButton(type: .system)

    private let haptics = UISelectionFeedbackGenerator()
    private let impactHaptics = UIImpactFeedbackGenerator(style: .light)
    private var isInteractingRail = false
    private var dragTargetIndex: Int = 0
    private var lastCartProminent: Bool?
    private var railEdgeInteraction: UIScrollEdgeElementContainerInteraction?

    init(scrollView: UIScrollView) {
        self.scrollView = scrollView

        let railGroup = UIGlassContainerEffect()
        railGroup.spacing = 12
        railContainer = UIVisualEffectView(effect: railGroup)

        let railGlass = UIGlassEffect(style: .regular)
        railGlass.isInteractive = true
        railNavPill = UIVisualEffectView(effect: railGlass)
        railNavPill.cornerConfiguration = .capsule()

        // Lifted optical clear Liquid Glass droplet that appears on press/drag (never double-frosted at rest)
        let dropletGlass = UIGlassEffect(style: .clear)
        dropletGlass.isInteractive = true
        dropletGlass.tintColor = Self.brandOrange.withAlphaComponent(0.10)
        railActiveDroplet = UIVisualEffectView(effect: dropletGlass)
        railActiveDroplet.cornerConfiguration = .capsule()
        railActiveDroplet.isUserInteractionEnabled = false
        railActiveDroplet.alpha = 0

        super.init(frame: .zero)
        backgroundColor = .clear
        setupBottomChrome()
        setupRailChrome()
        attachScrollEdgeInteractions()
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError() }

    private func attachScrollEdgeInteractions() {
        guard let sv = scrollView else { return }
        // Native iOS 26/27 soft scroll-edge feathering so web content dissolves smoothly under glass chrome
        sv.topEdgeEffect.style = .soft
        sv.bottomEdgeEffect.style = .soft
        sv.leftEdgeEffect.style = .soft

        let bottomEdge = UIScrollEdgeElementContainerInteraction()
        bottomEdge.scrollView = sv
        bottomEdge.edge = .bottom
        bottomWrapper.addInteraction(bottomEdge)

        sv.rightEdgeEffect.style = .soft
        let railEdge = UIScrollEdgeElementContainerInteraction()
        railEdge.scrollView = sv
        railEdge.edge = .left
        railContainer.addInteraction(railEdge)
        railEdgeInteraction = railEdge
    }

    /// The rail's scroll-edge feathering must sit on the edge the rail is on;
    /// a left-edge interaction on a right-side rail blurs the whole content width.
    private func updateRailEdge(for state: LiquidGlassChromeState) {
        let edge: UIRectEdge = (state.mode == "edgeRail" && state.edge != "left") ? .right : .left
        if railEdgeInteraction?.edge != edge { railEdgeInteraction?.edge = edge }
    }

    // MARK: Setup Bottom Native UITabBar + Prominent Glass Cart Pill

    private func setupBottomChrome() {
        bottomWrapper.backgroundColor = .clear
        bottomWrapper.isHidden = true
        addSubview(bottomWrapper)

        // Leave UITabBar's background/appearance completely unaltered per Apple HIG & Developer Forums
        // so iOS 26/27 renders authentic Metal Liquid Glass + optical magnifying lens on press/drag.
        bottomTabBar.delegate = self
        bottomTabBar.tintColor = Self.brandDark
        bottomTabBar.unselectedItemTintColor = Self.inkNeutral

        let symbolCfg = UIImage.SymbolConfiguration(weight: .semibold)
        bottomTabItems = (0..<Self.tabKeys.count).map { i in
            let item = UITabBarItem(
                title: "",
                image: UIImage(systemName: Self.tabSymbols[i], withConfiguration: symbolCfg),
                selectedImage: UIImage(systemName: Self.tabSymbolsSelected[i], withConfiguration: symbolCfg)
            )
            item.tag = i
            return item
        }
        bottomTabBar.items = bottomTabItems
        bottomTabBar.selectedItem = bottomTabItems.first
        bottomWrapper.addSubview(bottomTabBar)

        // Native iOS 26/27 Prominent Liquid Glass Cart button (authentic touch-down illumination glow)
        var cartConfig = UIButton.Configuration.prominentGlass()
        cartConfig.baseBackgroundColor = Self.brandOrange
        cartConfig.baseForegroundColor = .white
        cartConfig.cornerStyle = .capsule
        bottomCartButton.configuration = cartConfig
        bottomCartButton.alpha = 0
        bottomCartButton.isHidden = true
        bottomCartButton.addTarget(self, action: #selector(handleCartTap), for: .touchUpInside)
        bottomWrapper.addSubview(bottomCartButton)

        bottomCartCountLabel.font = .systemFont(ofSize: 13, weight: .black)
        bottomCartCountLabel.textColor = Self.brandDark
        bottomCartCountLabel.backgroundColor = .white
        bottomCartCountLabel.textAlignment = .center
        bottomCartCountLabel.layer.cornerRadius = 12
        bottomCartCountLabel.clipsToBounds = true
        bottomCartCountLabel.isUserInteractionEnabled = false

        bottomCartTitleLabel.font = .systemFont(ofSize: 15, weight: .bold)
        bottomCartTitleLabel.textColor = .white
        bottomCartTitleLabel.isUserInteractionEnabled = false

        bottomCartTotalLabel.font = .monospacedDigitSystemFont(ofSize: 15, weight: .heavy)
        bottomCartTotalLabel.textColor = .white
        bottomCartTotalLabel.textAlignment = .right
        bottomCartTotalLabel.isUserInteractionEnabled = false

        bottomCartButton.addSubview(bottomCartCountLabel)
        bottomCartButton.addSubview(bottomCartTitleLabel)
        bottomCartButton.addSubview(bottomCartTotalLabel)
    }

    // MARK: Setup Unfolded iPhone Duo Liquid Glass Rail

    private func setupRailChrome() {
        railContainer.isHidden = true
        addSubview(railContainer)

        railContainer.contentView.addSubview(railNavPill)

        // Clean translucent resting platter (concentric capsule — avoids muddy glass-on-glass at rest)
        railRestPlatter.backgroundColor = Self.brandOrange.withAlphaComponent(0.14)
        railRestPlatter.cornerConfiguration = .capsule()
        railRestPlatter.layer.borderWidth = 0.75
        railRestPlatter.layer.borderColor = UIColor.white.withAlphaComponent(0.72).cgColor
        railRestPlatter.isUserInteractionEnabled = false
        railNavPill.contentView.addSubview(railRestPlatter)

        for i in 0..<Self.tabKeys.count {
            let slot = GlassTabSlotView(symbol: Self.tabSymbols[i], selectedSymbol: Self.tabSymbolsSelected[i], title: "")
            railNavPill.contentView.addSubview(slot)
            railTabViews.append(slot)
        }

        // Lifted clear Liquid Glass droplet floats over hovered slot during touch/drag
        railNavPill.contentView.addSubview(railActiveDroplet)

        let railPress = UILongPressGestureRecognizer(target: self, action: #selector(handleRailTouch(_:)))
        railPress.minimumPressDuration = 0
        railPress.allowableMovement = .greatestFiniteMagnitude
        railPress.delegate = self
        railNavPill.addGestureRecognizer(railPress)

        let railPan = UIPanGestureRecognizer(target: self, action: #selector(handleRailPan(_:)))
        railPan.delegate = self
        railNavPill.addGestureRecognizer(railPan)

        // Native iOS 26/27 circular Liquid Glass Cart button
        configureRailCartButton(prominent: false)
        railCartButton.addTarget(self, action: #selector(handleCartTap), for: .touchUpInside)
        railContainer.contentView.addSubview(railCartButton)

        railCartBadge.font = .monospacedDigitSystemFont(ofSize: 10.5, weight: .black)
        railCartBadge.textColor = .white
        railCartBadge.backgroundColor = UIColor(red: 0.11, green: 0.10, blue: 0.09, alpha: 1)
        railCartBadge.textAlignment = .center
        railCartBadge.layer.cornerRadius = 9.5
        railCartBadge.layer.borderWidth = 1.5
        railCartBadge.layer.borderColor = UIColor.white.cgColor
        railCartBadge.clipsToBounds = true
        railCartBadge.isHidden = true
        railCartBadge.isUserInteractionEnabled = false
        railContainer.contentView.addSubview(railCartBadge)

        // Native iOS 26/27 circular Liquid Glass Settings button
        var settingsConfig = UIButton.Configuration.glass()
        settingsConfig.image = UIImage(
            systemName: "gearshape.fill",
            withConfiguration: UIImage.SymbolConfiguration(pointSize: 17, weight: .medium)
        )
        settingsConfig.baseForegroundColor = Self.inkNeutral
        settingsConfig.cornerStyle = .capsule
        railSettingsButton.configuration = settingsConfig
        railSettingsButton.addTarget(self, action: #selector(handleSettingsTap), for: .touchUpInside)
        railContainer.contentView.addSubview(railSettingsButton)
    }

    private func configureRailCartButton(prominent: Bool) {
        guard lastCartProminent != prominent else { return }
        lastCartProminent = prominent
        var config = prominent ? UIButton.Configuration.prominentGlass() : UIButton.Configuration.glass()
        config.image = UIImage(
            systemName: "cart.fill",
            withConfiguration: UIImage.SymbolConfiguration(pointSize: 18, weight: .semibold)
        )
        config.cornerStyle = .capsule
        if prominent {
            config.baseBackgroundColor = Self.brandOrange
            config.baseForegroundColor = .white
        } else {
            config.baseForegroundColor = Self.brandDark
        }
        railCartButton.configuration = config
    }

    // Allow press + pan simultaneously on the Duo rail so touch-down immediately lifts the glass droplet
    func gestureRecognizer(
        _ gestureRecognizer: UIGestureRecognizer,
        shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer
    ) -> Bool {
        return true
    }

    // Pass touches outside actual floating glass controls straight through to WKWebView
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        guard !isHidden && alpha > 0.01 else { return nil }

        if !bottomWrapper.isHidden && bottomWrapper.alpha > 0.01 {
            if !bottomCartButton.isHidden && bottomCartButton.alpha > 0.01 {
                let p = convert(point, to: bottomCartButton)
                if bottomCartButton.bounds.insetBy(dx: -4, dy: -4).contains(p) {
                    return bottomCartButton.hitTest(p, with: event) ?? bottomCartButton
                }
            }
            if !bottomTabBar.isHidden && bottomTabBar.alpha > 0.01 {
                let p = convert(point, to: bottomTabBar)
                if bottomTabBar.bounds.contains(p) {
                    return bottomTabBar.hitTest(p, with: event)
                }
            }
        }

        if !railContainer.isHidden && railContainer.alpha > 0.01 {
            let railPills: [UIView] = [railNavPill, railCartButton, railSettingsButton]
            for pill in railPills {
                guard !pill.isHidden && pill.alpha > 0.01 else { continue }
                let p = convert(point, to: pill)
                if pill.bounds.insetBy(dx: -4, dy: -4).contains(p) {
                    return pill.hitTest(p, with: event) ?? pill
                }
            }
        }

        return nil
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        layoutChrome()
    }

    func apply(_ state: LiquidGlassChromeState) {
        let prev = currentState
        currentState = state
        let newIdx = Self.tabKeys.firstIndex(of: state.activeTab) ?? 0
        let tabChanged = newIdx != selectedIndex
        selectedIndex = newIdx

        // Sync native UITabBar items & selection
        for (i, item) in bottomTabItems.enumerated() {
            let label = i < state.labels.count ? state.labels[i] : ""
            if item.title != label { item.title = label }
        }
        if newIdx < bottomTabItems.count && bottomTabBar.selectedItem !== bottomTabItems[newIdx] {
            bottomTabBar.selectedItem = bottomTabItems[newIdx]
        }

        // Sync Duo rail slot labels & selection
        for (i, slot) in railTabViews.enumerated() {
            let label = i < state.labels.count ? state.labels[i] : ""
            slot.configure(title: label, selected: i == selectedIndex, accent: Self.brandDark, neutral: Self.inkNeutral)
        }

        // Sync Cart button labels & badges
        bottomCartCountLabel.text = "\(state.cartCount)"
        bottomCartTitleLabel.text = state.cartLabel
        bottomCartTotalLabel.text = state.cartTotal

        let hasItems = state.cartCount > 0
        configureRailCartButton(prominent: hasItems || state.cartActive)
        railCartBadge.text = "\(state.cartCount)"
        railCartBadge.isHidden = !hasItems

        let showBottom = state.visible && state.mode == "bottom" && (state.showTabs || hasItems)
        let isEdgeRail = state.mode == "edgeRail"
        updateRailEdge(for: state)
        let showRail = state.visible && (state.mode == "rail" || (isEdgeRail && (state.showTabs || hasItems)))
        // On the cover screen the rail stands in for the bottom tab bar, so the
        // tab pill and settings follow showTabs (hidden on e.g. restaurant pages).
        let showRailTabs = !isEdgeRail || state.showTabs
        railNavPill.isHidden = !showRailTabs
        railSettingsButton.isHidden = !showRailTabs
        let railHiddenShift: CGFloat = (isEdgeRail && state.edge != "left") ? 16 : -16

        if showBottom {
            bottomWrapper.isHidden = false
            if state.showTabs { bottomTabBar.isHidden = false }
        }
        if showRail {
            railContainer.isHidden = false
        }

        let visibilityChanged = prev?.visible != state.visible || prev?.mode != state.mode || prev?.showTabs != state.showTabs

        if hasItems && showBottom && bottomCartButton.isHidden {
            bottomCartButton.isHidden = false
            bottomCartButton.alpha = 0
            bottomCartButton.transform = CGAffineTransform(translationX: 0, y: 16).scaledBy(x: 0.92, y: 0.92)
        }

        layoutChrome()

        UIView.animate(springDuration: 0.44, bounce: 0.30, options: [.allowUserInteraction, .beginFromCurrentState]) {
            self.bottomWrapper.alpha = showBottom ? 1 : 0
            self.bottomTabBar.alpha = (showBottom && state.showTabs) ? 1 : 0
            self.bottomTabBar.transform = (showBottom && state.showTabs) ? .identity : CGAffineTransform(translationX: 0, y: 20).scaledBy(x: 0.96, y: 0.96)

            self.bottomCartButton.alpha = (showBottom && hasItems) ? 1 : 0
            self.bottomCartButton.transform = (showBottom && hasItems) ? .identity : CGAffineTransform(translationX: 0, y: 14).scaledBy(x: 0.92, y: 0.92)

            self.railContainer.alpha = showRail ? 1 : 0
            self.railContainer.transform = showRail ? .identity : CGAffineTransform(translationX: railHiddenShift, y: 0).scaledBy(x: 0.96, y: 0.96)

            if (tabChanged || visibilityChanged) && !self.isInteractingRail {
                self.positionRailIndicators(for: CGFloat(self.selectedIndex), dropletActive: false, velocityY: 0)
            }
        } completion: { _ in
            if !showBottom { self.bottomWrapper.isHidden = true }
            if !(showBottom && state.showTabs) { self.bottomTabBar.isHidden = true }
            if !(showBottom && hasItems) { self.bottomCartButton.isHidden = true }
            if !showRail { self.railContainer.isHidden = true }
        }
    }

    private func layoutChrome() {
        let w = bounds.width
        let h = bounds.height
        guard w > 0, h > 0 else { return }
        let safe = safeAreaInsets
        let state = currentState
        let showTabs = state?.showTabs ?? true
        let hasCart = (state?.cartCount ?? 0) > 0

        // 1. Bottom floating native UITabBar + Prominent Glass Cart Pill
        let fittedTabH = max(56, bottomTabBar.sizeThatFits(CGSize(width: w, height: 100)).height)
        let tabBottomLift = max(6, safe.bottom - 18)
        let tabBarH = fittedTabH
        let cartH: CGFloat = 52
        let cartGap: CGFloat = 10
        let wrapperH = (showTabs ? (tabBarH + tabBottomLift) : max(16, safe.bottom + 8)) + (hasCart ? (cartH + cartGap) : 0) + 12

        bottomWrapper.frame = CGRect(x: 0, y: h - wrapperH, width: w, height: wrapperH)
        bottomTabBar.frame = CGRect(x: 0, y: wrapperH - tabBarH - tabBottomLift, width: w, height: tabBarH)

        let cartW = min(384, w - max(32, safe.left + safe.right + 32))
        let cartY = showTabs ? (bottomTabBar.frame.minY - cartGap - cartH) : (wrapperH - max(16, safe.bottom + 8) - cartH)
        bottomCartButton.frame = CGRect(x: (w - cartW) / 2, y: cartY, width: cartW, height: cartH)
        bottomCartCountLabel.frame = CGRect(x: 16, y: (cartH - 24) / 2, width: 24, height: 24)
        bottomCartTotalLabel.frame = CGRect(x: cartW - 136, y: 0, width: 118, height: cartH)
        bottomCartTitleLabel.frame = CGRect(x: 48, y: 0, width: cartW - 188, height: cartH)

        // 2. Liquid Glass Rail: unfolded iPhone Duo (left, full height) or folded
        //    cover screen ("edgeRail": inside the side safe-area column that holds
        //    the camera/status bar, stacked from the bottom so it clears them).
        let railW: CGFloat = 68
        let navH: CGFloat = 252
        let railBottom = max(20, safe.bottom + 8)
        let railFrame: CGRect
        if state?.mode == "edgeRail" {
            let containerW = railW + 12
            let onLeft = state?.edge == "left"
            let column = onLeft ? safe.left : safe.right
            let x = onLeft
                ? max(0, (column - containerW) / 2)
                : w - max(containerW + 2, column) + max(0, (column - containerW) / 2)
            // nav pill + gap + cart + gap + settings
            let groupH = navH + 12 + 52 + 12 + 48
            railFrame = CGRect(x: x, y: max(20, h - railBottom - groupH), width: containerW, height: groupH)
        } else {
            let railLeading = max(14, safe.left + 8)
            let railTop = max(20, safe.top + 8)
            railFrame = CGRect(x: railLeading - 6, y: railTop, width: railW + 12, height: max(360, h - railTop - railBottom))
        }
        // Set bounds/center rather than frame: the hide animation applies a transform.
        railContainer.bounds = CGRect(origin: .zero, size: railFrame.size)
        railContainer.center = CGPoint(x: railFrame.midX, y: railFrame.midY)
        let railContainerH = railFrame.height

        railNavPill.frame = CGRect(x: 6, y: 0, width: railW, height: navH)
        let inset: CGFloat = 6
        let railSlotH = (navH - inset * 2) / CGFloat(Self.tabKeys.count)
        for (i, slot) in railTabViews.enumerated() {
            slot.frame = CGRect(x: inset, y: inset + CGFloat(i) * railSlotH, width: railW - inset * 2, height: railSlotH)
        }
        if !isInteractingRail {
            positionRailIndicators(for: CGFloat(selectedIndex), dropletActive: false, velocityY: 0)
        }

        let settingsSize: CGFloat = 48
        let cartSize: CGFloat = 52
        let settingsY = railContainerH - settingsSize
        let cartYRail = settingsY - 12 - cartSize
        railSettingsButton.frame = CGRect(x: 6 + (railW - settingsSize) / 2, y: settingsY, width: settingsSize, height: settingsSize)
        railCartButton.frame = CGRect(x: 6 + (railW - cartSize) / 2, y: cartYRail, width: cartSize, height: cartSize)
        railCartBadge.frame = CGRect(x: railCartButton.frame.maxX - 15, y: railCartButton.frame.minY - 4, width: 20, height: 19)
    }

    private func positionRailIndicators(for fractionalIndex: CGFloat, dropletActive: Bool, velocityY: CGFloat) {
        let count = CGFloat(Self.tabKeys.count)
        let inset: CGFloat = 6
        let innerH = max(1, railNavPill.bounds.height - inset * 2)
        let slotH = innerH / count
        let clamped = max(-0.10, min(count - 0.90, fractionalIndex))
        let pillW = railNavPill.bounds.width - inset * 2
        let centerPt = CGPoint(x: railNavPill.bounds.midX, y: inset + (clamped + 0.5) * slotH)

        // Concentric resting platter (exact capsule geometry inside outer capsule)
        railRestPlatter.bounds = CGRect(x: 0, y: 0, width: pillW, height: slotH - 2)
        railRestPlatter.center = centerPt
        railRestPlatter.alpha = dropletActive ? 0.25 : 1.0

        // Optical clear Liquid Glass droplet with volume-preserving jelly stretch on drag
        railActiveDroplet.bounds = CGRect(x: 0, y: 0, width: pillW, height: slotH - 2)
        railActiveDroplet.center = centerPt
        railActiveDroplet.alpha = dropletActive ? 1.0 : 0.0
        if dropletActive {
            let stretch = min(0.22, abs(velocityY) / 1400.0)
            let sy = 1.14 + stretch
            let sx = 1.14 / sqrt(1.0 + stretch)
            railActiveDroplet.transform = CGAffineTransform(scaleX: sx, y: sy)
        } else {
            railActiveDroplet.transform = .identity
        }
    }

    // MARK: - UITabBarDelegate (Native iOS 26/27 Bottom Tab Bar)

    func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) {
        let idx = max(0, min(Self.tabKeys.count - 1, item.tag))
        if idx != selectedIndex {
            selectedIndex = idx
            onTabSelected?(Self.tabKeys[idx])
        }
    }

    // MARK: - Interactive Liquid Droplet Gestures (Duo Rail)

    @objc private func handleRailTouch(_ gr: UILongPressGestureRecognizer) {
        let count = Self.tabKeys.count
        let inset: CGFloat = 6
        let slotH = max(1, (railNavPill.bounds.height - inset * 2) / CGFloat(count))
        let y = gr.location(in: railNavPill).y
        let rawFrac = (y - inset) / slotH - 0.5
        let clampedIdx = max(0, min(count - 1, Int(round(rawFrac))))

        switch gr.state {
        case .began:
            isInteractingRail = true
            dragTargetIndex = clampedIdx
            haptics.prepare()
            updateRailSlotMagnification(hovered: clampedIdx, active: true)
            UIView.animate(springDuration: 0.28, bounce: 0.30, options: [.allowUserInteraction, .beginFromCurrentState]) {
                self.positionRailIndicators(for: rawFrac, dropletActive: true, velocityY: 0)
            }
        case .changed:
            if clampedIdx != dragTargetIndex {
                dragTargetIndex = clampedIdx
                haptics.selectionChanged()
                updateRailSlotMagnification(hovered: clampedIdx, active: true)
            }
            UIView.animate(springDuration: 0.16, bounce: 0.15, options: [.allowUserInteraction, .beginFromCurrentState]) {
                self.positionRailIndicators(for: rawFrac, dropletActive: true, velocityY: 0)
            }
        case .ended, .cancelled, .failed:
            isInteractingRail = false
            commitRailSelection(clampedIdx)
        default:
            break
        }
    }

    @objc private func handleRailPan(_ gr: UIPanGestureRecognizer) {
        guard isInteractingRail, gr.state == .changed else { return }
        let count = Self.tabKeys.count
        let inset: CGFloat = 6
        let slotH = max(1, (railNavPill.bounds.height - inset * 2) / CGFloat(count))
        let rawFrac = (gr.location(in: railNavPill).y - inset) / slotH - 0.5
        let vy = gr.velocity(in: railNavPill).y
        UIView.animate(springDuration: 0.14, bounce: 0.12, options: [.allowUserInteraction, .beginFromCurrentState]) {
            self.positionRailIndicators(for: rawFrac, dropletActive: true, velocityY: vy)
        }
    }

    private func updateRailSlotMagnification(hovered: Int, active: Bool) {
        for (i, slot) in railTabViews.enumerated() {
            let isHovered = (i == hovered)
            slot.setSelected(isHovered, accent: Self.brandDark, neutral: Self.inkNeutral)
            UIView.animate(springDuration: 0.26, bounce: 0.28, options: [.allowUserInteraction, .beginFromCurrentState]) {
                slot.transform = (active && isHovered) ? CGAffineTransform(scaleX: 1.09, y: 1.09) : .identity
            }
        }
    }

    private func commitRailSelection(_ idx: Int) {
        let changed = idx != selectedIndex
        selectedIndex = idx
        if changed {
            haptics.selectionChanged()
        }
        updateRailSlotMagnification(hovered: idx, active: false)

        UIView.animate(springDuration: 0.44, bounce: 0.34, options: [.allowUserInteraction, .beginFromCurrentState]) {
            self.positionRailIndicators(for: CGFloat(idx), dropletActive: false, velocityY: 0)
        }

        if changed {
            onTabSelected?(Self.tabKeys[idx])
        }
    }

    @objc private func handleCartTap() {
        impactHaptics.impactOccurred()
        onCartTapped?()
    }

    @objc private func handleSettingsTap() {
        impactHaptics.impactOccurred()
        onSettingsTapped?()
    }
}

private final class GlassTabSlotView: UIView {
    private let iconView = UIImageView()
    private let titleLabel = UILabel()
    private let symbolName: String
    private let selectedSymbolName: String

    init(symbol: String, selectedSymbol: String, title: String) {
        self.symbolName = symbol
        self.selectedSymbolName = selectedSymbol
        super.init(frame: .zero)
        isUserInteractionEnabled = false

        iconView.contentMode = .scaleAspectFit
        titleLabel.font = .systemFont(ofSize: 10.5, weight: .bold)
        titleLabel.textAlignment = .center
        titleLabel.text = title
        titleLabel.adjustsFontSizeToFitWidth = true
        titleLabel.minimumScaleFactor = 0.85

        addSubview(iconView)
        addSubview(titleLabel)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError() }

    override func layoutSubviews() {
        super.layoutSubviews()
        let iconSize: CGFloat = 22
        iconView.frame = CGRect(x: (bounds.width - iconSize) / 2, y: max(4, bounds.midY - 17), width: iconSize, height: iconSize)
        titleLabel.frame = CGRect(x: 2, y: iconView.frame.maxY + 2, width: bounds.width - 4, height: 14)
    }

    func configure(title: String, selected: Bool, accent: UIColor, neutral: UIColor) {
        titleLabel.text = title
        setSelected(selected, accent: accent, neutral: neutral)
    }

    func setSelected(_ selected: Bool, accent: UIColor, neutral: UIColor) {
        let cfg = UIImage.SymbolConfiguration(pointSize: 18, weight: selected ? .semibold : .regular)
        iconView.image = UIImage(systemName: selected ? selectedSymbolName : symbolName, withConfiguration: cfg)
        let color = selected ? accent : neutral
        iconView.tintColor = color
        titleLabel.textColor = color
        titleLabel.font = .systemFont(ofSize: 10.5, weight: selected ? .heavy : .semibold)
    }
}
