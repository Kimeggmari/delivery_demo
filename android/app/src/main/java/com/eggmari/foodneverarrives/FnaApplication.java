package com.eggmari.foodneverarrives;

import android.app.Application;
import android.content.pm.ApplicationInfo;
import android.util.Log;

import io.adrop.ads.Adrop;
import io.adrop.ads.model.AdropTheme;

public class FnaApplication extends Application {
    private static final String TAG = "FnaApplication";

    // True only when the Adrop SDK initialized; AdropNativePlugin checks this.
    static volatile boolean adropReady = false;

    @Override
    public void onCreate() {
        super.onCreate();
        initAdrop();
    }

    private void initAdrop() {
        // The SDK needs adrop_service.json (console > Admin > App) in app/src/main/assets.
        // Without it we skip ads entirely instead of risking a crash at launch.
        try {
            getAssets().open("adrop_service.json").close();
        } catch (Exception e) {
            Log.w(TAG, "adrop_service.json missing, Adrop disabled");
            return;
        }
        try {
            // production=false serves test ads only, so tie it to the build type:
            // debug builds -> test mode, release builds -> production.
            boolean debuggable = (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
            Adrop.initialize(this, !debuggable, new String[] {});
            Adrop.setTheme(AdropTheme.AUTO);
            adropReady = true;
        } catch (Throwable t) {
            Log.w(TAG, "Adrop init failed", t);
        }
    }
}
