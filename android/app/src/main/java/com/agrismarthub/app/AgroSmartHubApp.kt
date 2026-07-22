package com.agrismarthub.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class AgroSmartHubApp : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
