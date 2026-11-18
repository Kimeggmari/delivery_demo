package com.eggmari.foodneverarrives;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import io.adrop.ads.model.AdropErrorCode;
import io.adrop.ads.popupAd.AdropPopupAd;
import io.adrop.ads.popupAd.AdropPopupAdListener;

// Bridges the native-only Adrop formats (popupBottom now, splash later) to JS.
// Banner/native ads are rendered in the WebView by the Adrop web SDK instead.
@CapacitorPlugin(name = "AdropNative")
public class AdropNativePlugin extends Plugin {
    private AdropPopupAd popup;

    @PluginMethod
    public void showPopup(PluginCall call) {
        final String unitId = call.getString("unitId");
        if (unitId == null || unitId.isEmpty()) {
            call.reject("unitId is required");
            return;
        }
        if (!FnaApplication.adropReady) {
            call.reject("Adrop is not initialized");
            return;
        }
        getActivity().runOnUiThread(() -> {
            destroyPopup();
            final AdropPopupAd ad = new AdropPopupAd(getActivity(), unitId);
            popup = ad;
            ad.setPopupAdListener(new AdropPopupAdListener() {
                @Override
                public void onAdReceived(AdropPopupAd received) {
                    if (getActivity() != null && !getActivity().isFinishing()) {
                        received.show(getActivity());
                    }
                    call.resolve();
                }

                @Override
                public void onAdFailedToReceive(AdropPopupAd failed, AdropErrorCode code) {
                    // e.g. no fill, or the user chose "hide for today"
                    call.reject(String.valueOf(code));
                }
            });
            ad.load();
        });
    }

    @Override
    protected void handleOnDestroy() {
        destroyPopup();
        super.handleOnDestroy();
    }

    private void destroyPopup() {
        if (popup != null) {
            popup.destroy();
            popup = null;
        }
    }
}
