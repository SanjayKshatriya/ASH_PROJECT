package com.agrismarthub.app.data

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.agrismarthub.app.data.models.SessionUser
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Manages local user session using EncryptedSharedPreferences for security.
 */
@Singleton
class SessionManager @Inject constructor(
    @ApplicationContext context: Context,
    private val gson: Gson
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "ash_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveSession(user: SessionUser) {
        prefs.edit().putString("current_user", gson.toJson(user)).apply()
    }

    fun getSession(): SessionUser? {
        val userStr = prefs.getString("current_user", null)
        return if (userStr != null) gson.fromJson(userStr, SessionUser::class.java) else null
    }

    fun clearSession() {
        prefs.edit().remove("current_user").apply()
    }

    fun isLoggedIn(): Boolean {
        return getSession() != null
    }

    fun getToken(): String? {
        return getSession()?.token
    }
}
