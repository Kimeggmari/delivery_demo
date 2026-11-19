import UIKit
import Capacitor
import AdropAds
import AppTrackingTransparency

/// Bridges Adrop's native ad views into the Capacitor web UI.
///
/// The app's screens are HTML, so inline ads (banner / native) are real
/// UIKit views laid over the WKWebView: the web side reserves a placeholder
/// and reports its document-space rect; each ad lives in a clip view inside
/// the web view's scroll view, so it scrolls with the page natively and is
/// clipped to the band between the page's sticky header and fixed bottom bar.
@objc(AdropPlugin)
public class AdropPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AdropPlugin"
    public let jsName = "Adrop"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "showInline", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateInline", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeInline", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showPopup", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestTrackingAuthorization", returnType: CAPPluginReturnPromise),
    ]

    private var slots: [String: InlineAdSlot] = [:]
    private var popupAd: AdropPopupAd?
    private var offsetObservation: NSKeyValueObservation?
    private var boundsObservation: NSKeyValueObservation?

    // MARK: - Inline ads (banner / native)

    @objc func showInline(_ call: CAPPluginCall) {
        guard let id = call.getString("id"), let unitId = call.getString("unitId") else {
            call.reject("id and unitId are required"); return
        }
        let type = call.getString("type") ?? "banner"
        let layout = SlotLayout(call)
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let scrollView = self.bridge?.webView?.scrollView else {
                call.reject("web view not ready"); return
            }
            self.slots[id]?.destroy()
            let slot = InlineAdSlot(id: id, unitId: unitId, type: type) { [weak self] event, error in
                #if DEBUG
                NSLog("[AdropPlugin] %@ %@ %@", unitId, event, error ?? "")
                #endif
                var data: [String: Any] = ["id": id, "type": event]
                if let error = error { data["error"] = error }
                self?.notifyListeners("adEvent", data: data)
            }
            slot.layout = layout
            scrollView.addSubview(slot.clipView)
            self.slots[id] = slot
            self.observeScrollIfNeeded(scrollView)
            slot.reposition(in: scrollView)
            slot.load()
            call.resolve()
        }
    }

    @objc func updateInline(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else { call.reject("id is required"); return }
        let layout = SlotLayout(call)
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let slot = self.slots[id], let scrollView = self.bridge?.webView?.scrollView else {
                call.resolve(); return
            }
            slot.layout = layout
            slot.reposition(in: scrollView)
            call.resolve()
        }
    }

    @objc func removeInline(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else { call.reject("id is required"); return }
        DispatchQueue.main.async { [weak self] in
            self?.slots.removeValue(forKey: id)?.destroy()
            call.resolve()
        }
    }

    private func observeScrollIfNeeded(_ scrollView: UIScrollView) {
        guard offsetObservation == nil else { return }
        let reposition: (UIScrollView) -> Void = { [weak self] sv in
            self?.slots.values.forEach { $0.reposition(in: sv) }
        }
        offsetObservation = scrollView.observe(\.contentOffset, options: [.new]) { sv, _ in reposition(sv) }
        boundsObservation = scrollView.observe(\.bounds, options: [.new]) { sv, _ in reposition(sv) }
    }

    // MARK: - App Tracking Transparency

    /// Shows the ATT prompt (once; iOS remembers the answer) and resolves with
    /// the resulting status. The system only shows it while the app is active.
    @objc func requestTrackingAuthorization(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            ATTrackingManager.requestTrackingAuthorization { status in
                let name: String
                switch status {
                case .authorized: name = "authorized"
                case .denied: name = "denied"
                case .restricted: name = "restricted"
                case .notDetermined: name = "notDetermined"
                @unknown default: name = "unknown"
                }
                call.resolve(["status": name])
            }
        }
    }

    // MARK: - Popup

    @objc func showPopup(_ call: CAPPluginCall) {
        guard let unitId = call.getString("unitId") else { call.reject("unitId is required"); return }
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let popup = AdropPopupAd(unitId: unitId)
            popup.onAdReceived = { [weak self] ad in
                self?.presentWhenOnScreen(ad, attempts: 40) { shown in
                    call.resolve(["shown": shown])
                }
            }
            popup.onAdFailedToReceive = { _, code in
                #if DEBUG
                NSLog("[AdropPlugin] popup %@ failed %@", unitId, code.keyString)
                #endif
                call.resolve(["shown": false, "error": code.keyString])
            }
            self.popupAd = popup
            popup.load()
        }
    }

    /// The popup must be presented from a view controller that is in the
    /// window. At cold start the splash ad may still be covering the web view,
    /// so wait (up to attempts × 0.25s) for it to finish.
    private func presentWhenOnScreen(_ ad: AdropPopupAd, attempts: Int, completion: @escaping (Bool) -> Void) {
        if let vc = bridge?.viewController, vc.view.window != nil, vc.presentedViewController == nil {
            ad.show(fromRootViewController: vc)
            completion(true)
            return
        }
        guard attempts > 0 else { completion(false); return }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { [weak self] in
            self?.presentWhenOnScreen(ad, attempts: attempts - 1, completion: completion)
        }
    }
}

/// Document-space placement reported by the web placeholder.
struct SlotLayout {
    var x: CGFloat = 0
    var y: CGFloat = 0
    var width: CGFloat = 0
    var height: CGFloat = 0
    var clipTop: CGFloat = 0
    var clipBottom: CGFloat = 0
    var visible = false

    init() {}

    init(_ call: CAPPluginCall) {
        x = CGFloat(call.getDouble("x") ?? 0)
        y = CGFloat(call.getDouble("y") ?? 0)
        width = CGFloat(call.getDouble("width") ?? 0)
        height = CGFloat(call.getDouble("height") ?? 0)
        clipTop = CGFloat(call.getDouble("clipTop") ?? 0)
        clipBottom = CGFloat(call.getDouble("clipBottom") ?? 0)
        visible = call.getBool("visible") ?? false
    }
}

/// Lets touches outside the ad fall through to the web content underneath.
final class PassthroughView: UIView {
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let hit = super.hitTest(point, with: event)
        return hit === self ? nil : hit
    }
}

final class InlineAdSlot {
    let id: String
    let clipView = PassthroughView()
    var layout = SlotLayout()

    private let adView: UIView
    private var banner: AdropBanner?
    private var nativeAd: AdropNativeAd?
    private var nativeCard: NativeAdCard?

    init(id: String, unitId: String, type: String, onEvent: @escaping (String, String?) -> Void) {
        self.id = id
        clipView.clipsToBounds = true
        clipView.isHidden = true

        if type == "native" {
            let card = NativeAdCard()
            let ad = AdropNativeAd(unitId: unitId)
            ad.onAdReceived = { [weak card] ad in
                card?.bind(ad)
                onEvent("received", nil)
            }
            ad.onAdFailedToReceive = { _, code in onEvent("failed", code.keyString) }
            nativeAd = ad
            nativeCard = card
            adView = card
        } else {
            let banner = AdropBanner(unitId: unitId)
            banner.onAdReceived = { _ in onEvent("received", nil) }
            banner.onAdFailedToReceive = { _, code in onEvent("failed", code.keyString) }
            self.banner = banner
            adView = banner
        }
        clipView.addSubview(adView)
    }

    func load() {
        banner?.load()
        nativeAd?.load()
    }

    func reposition(in scrollView: UIScrollView) {
        let offsetY = scrollView.contentOffset.y
        let viewport = scrollView.bounds.size
        let bandHeight = max(0, viewport.height - layout.clipTop - layout.clipBottom)
        clipView.frame = CGRect(x: 0, y: offsetY + layout.clipTop, width: viewport.width, height: bandHeight)
        adView.frame = CGRect(x: layout.x, y: layout.y - offsetY - layout.clipTop, width: layout.width, height: layout.height)
        clipView.isHidden = !layout.visible || layout.width <= 0 || layout.height <= 0
        scrollView.bringSubviewToFront(clipView)
    }

    func destroy() {
        banner?.destroy()
        clipView.removeFromSuperview()
    }
}

/// Native ad layout for the 320×180 unit: 16:9 media with a headline /
/// call-to-action strip underneath. The web placeholder reserves the same
/// height (width × 9/16 + stripHeight).
final class NativeAdCard: UIView {
    static let stripHeight: CGFloat = 52

    private let adView = AdropNativeAdView(frame: .zero)
    private let mediaView = UIView()
    private let headlineLabel = UILabel()
    private let ctaLabel = PaddedLabel()

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .white
        layer.cornerRadius = 16
        layer.borderWidth = 1
        layer.borderColor = UIColor(red: 0.90, green: 0.91, blue: 0.92, alpha: 1).cgColor
        clipsToBounds = true

        mediaView.backgroundColor = UIColor(red: 0.95, green: 0.96, blue: 0.96, alpha: 1)
        mediaView.clipsToBounds = true

        headlineLabel.font = .systemFont(ofSize: 14, weight: .heavy)
        headlineLabel.textColor = UIColor(red: 0.07, green: 0.09, blue: 0.15, alpha: 1)
        headlineLabel.numberOfLines = 1

        ctaLabel.font = .systemFont(ofSize: 12, weight: .heavy)
        ctaLabel.textColor = .white
        ctaLabel.backgroundColor = UIColor(red: 0.92, green: 0.35, blue: 0.05, alpha: 1)
        ctaLabel.layer.cornerRadius = 10
        ctaLabel.clipsToBounds = true
        ctaLabel.textAlignment = .center

        addSubview(adView)
        [mediaView, headlineLabel, ctaLabel].forEach { adView.addSubview($0) }
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    func bind(_ ad: AdropNativeAd) {
        // The SDK renders the media and tracks clicks/impressions on bound
        // views, but text comes from the ad object.
        headlineLabel.text = ad.headline.isEmpty ? ad.body : ad.headline
        ctaLabel.text = ad.callToAction
        adView.setMediaView(mediaView)
        adView.setHeadLineView(headlineLabel)
        adView.setCallToActionView(ctaLabel)
        adView.setIsEntireClick(true)
        adView.setNativeAd(ad)
        ctaLabel.isHidden = ad.callToAction.isEmpty
        setNeedsLayout()
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        adView.frame = bounds
        let w = bounds.width
        let mediaHeight = max(0, bounds.height - Self.stripHeight)
        mediaView.frame = CGRect(x: 0, y: 0, width: w, height: mediaHeight)
        mediaView.subviews.forEach { $0.frame = mediaView.bounds }

        let ctaSize = ctaLabel.isHidden ? .zero : ctaLabel.sizeThatFits(CGSize(width: w / 2, height: 32))
        let ctaWidth = min(ctaSize.width, w / 2)
        ctaLabel.frame = CGRect(x: w - 12 - ctaWidth, y: mediaHeight + (Self.stripHeight - 32) / 2, width: ctaWidth, height: 32)
        let headlineRight = ctaLabel.isHidden ? w - 12 : ctaLabel.frame.minX - 10
        headlineLabel.frame = CGRect(x: 14, y: mediaHeight, width: max(0, headlineRight - 14), height: Self.stripHeight)
    }
}

final class PaddedLabel: UILabel {
    var insets = UIEdgeInsets(top: 0, left: 12, bottom: 0, right: 12)
    override func drawText(in rect: CGRect) { super.drawText(in: rect.inset(by: insets)) }
    override func sizeThatFits(_ size: CGSize) -> CGSize {
        let s = super.sizeThatFits(size)
        return CGSize(width: s.width + insets.left + insets.right, height: s.height + insets.top + insets.bottom)
    }
}
