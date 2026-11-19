import UIKit
import Capacitor

/// Main Capacitor view controller; registers the app-local Adrop plugin.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AdropPlugin())
    }
}
