plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.google.gms)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.agrismarthub.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.agrismarthub.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "3.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables { useSupportLibrary = true }

        // ── Supabase & API config ──
        buildConfigField(type = "String", name = "SUPABASE_URL", value = "\"https://mekkljheshjekexwpnso.supabase.co\"")
        buildConfigField(type = "String", name = "SUPABASE_ANON_KEY", value = "\"sb_publishable_seByaonj9SbXE9wOW0yLew_UVwVcsVC\"")
        buildConfigField(type = "String", name = "API_BASE_URL", value = "\"http://10.0.2.2:5000/api/\"")
        buildConfigField(type = "String", name = "OPENWEATHER_KEY", value = "\"YOUR_OPENWEATHER_KEY\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            buildConfigField("String", "API_BASE_URL", "\"https://your-production-api.com/api/\"")
        }
        debug {
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    packaging {
        resources { excludes += "/META-INF/{AL2.0,LGPL2.1}" }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.google.material)
    implementation(libs.androidx.navigation.compose)

    // Hilt DI
    implementation(libs.hilt.android)
    kapt(libs.hilt.android.compiler)
    implementation(libs.hilt.navigation.compose)

    // Networking
    implementation(libs.retrofit)
    implementation(libs.retrofit.gson)
    implementation(libs.okhttp.logging)

    // Supabase
    implementation(libs.supabase.gotrue)
    implementation(libs.supabase.postgrest)
    implementation(libs.supabase.realtime)
    implementation(libs.supabase.storage)
    implementation(libs.ktor.client.android)

    // Images
    implementation(libs.coil.compose)

    // Charts
    implementation(libs.vico.compose)
    implementation(libs.vico.compose.m3)

    // Storage
    implementation(libs.encrypted.prefs)
    implementation(libs.datastore.preferences)

    // Camera
    implementation(libs.camerax.core)
    implementation(libs.camerax.camera2)
    implementation(libs.camerax.lifecycle)
    implementation(libs.camerax.view)
    implementation(libs.accompanist.permissions)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)

    // Firebase
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.messaging)

    // Serialization
    implementation(libs.kotlinx.serialization.json)

    debugImplementation(libs.androidx.ui.tooling)
}
