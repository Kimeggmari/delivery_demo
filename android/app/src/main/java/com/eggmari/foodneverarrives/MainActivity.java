package com.eggmari.foodneverarrives;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import io.adrop.ads.Adrop;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. use Application Context
        // 2. true for production
        Adrop.initialize(getApplication(), !BuildConfig.DEBUG);
    }
}
