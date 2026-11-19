package com.eggmari.foodneverarrives;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import io.adrop.ads.Adrop;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Local plugins must be registered before super.onCreate builds the bridge.
        // Adrop.initialize lives in FnaApplication (guarded against a missing json).
        registerPlugin(AdropNativePlugin.class);
        super.onCreate(savedInstanceState);
        // Backfill needs the WebView registered so Adrop can detect in-app browsing (webview integration).
        if (FnaApplication.adropReady) {
            Adrop.registerWebView(bridge.getWebView());
        }
    }
}
