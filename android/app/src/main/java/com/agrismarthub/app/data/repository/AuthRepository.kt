package com.agrismarthub.app.data.repository

import com.agrismarthub.app.data.SessionManager
import com.agrismarthub.app.data.SupabaseClientProvider
import com.agrismarthub.app.data.models.AuthResponse
import com.agrismarthub.app.data.models.LoginRequest
import com.agrismarthub.app.data.models.RegisterRequest
import com.agrismarthub.app.data.models.SessionUser
import com.agrismarthub.app.data.models.User
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val sessionManager: SessionManager
) {
    private val supabase = SupabaseClientProvider.client

    suspend fun login(request: LoginRequest): AuthResponse = withContext(Dispatchers.IO) {
        try {
            // 1. Authenticate with Supabase Auth
            supabase.auth.signInWith(Email) {
                email = request.email
                password = request.password
            }

            val session = supabase.auth.currentSessionOrNull()
            val authUser = supabase.auth.currentUserOrNull()

            if (session == null || authUser == null) {
                return@withContext AuthResponse(error = "Invalid credentials or session could not be established.")
            }

            // 2. Fetch full profile from public.users
            val profile = supabase.postgrest["users"]
                .select { filter { eq("id", authUser.id) } }
                .decodeSingleOrNull<User>()

            if (profile == null) {
                return@withContext AuthResponse(error = "Profile not found in database.")
            }

            // 3. Save to local session
            val sessionUser = SessionUser(
                id = profile.id,
                name = profile.name,
                email = profile.email,
                role = profile.role,
                token = session.accessToken,
                state = profile.state ?: "",
                mobile = profile.mobile ?: ""
            )
            sessionManager.saveSession(sessionUser)

            AuthResponse(success = true, token = session.accessToken, user = profile)
        } catch (e: Exception) {
            AuthResponse(error = e.localizedMessage ?: "An error occurred during login")
        }
    }

    suspend fun register(request: RegisterRequest): AuthResponse = withContext(Dispatchers.IO) {
        try {
            // 1. Register with Supabase Auth
            supabase.auth.signUpWith(Email) {
                email = request.email
                password = request.password
                data = buildJsonObject {
                    put("name", request.name)
                    put("role", request.role)
                    put("mobile", request.mobile)
                    put("state", request.state)
                }
            }
            
            // Assuming email confirmation is disabled for now, similar to web backend
            val session = supabase.auth.currentSessionOrNull()
            val authUser = supabase.auth.currentUserOrNull()

            if (authUser == null) {
                return@withContext AuthResponse(error = "Registration failed.")
            }

            // 2. Insert into public.users (Often handled by Supabase triggers, but matching backend manual insert)
            val newUser = User(
                id = authUser.id,
                email = request.email,
                name = request.name,
                role = request.role,
                mobile = request.mobile.ifEmpty { null },
                state = request.state.ifEmpty { null }
            )
            
            supabase.postgrest["users"].insert(newUser)

            if (session != null) {
                val sessionUser = SessionUser(
                    id = newUser.id,
                    name = newUser.name,
                    email = newUser.email,
                    role = newUser.role,
                    token = session.accessToken,
                    state = newUser.state ?: "",
                    mobile = newUser.mobile ?: ""
                )
                sessionManager.saveSession(sessionUser)
            }

            AuthResponse(success = true, token = session?.accessToken, user = newUser)
        } catch (e: Exception) {
            AuthResponse(error = e.localizedMessage ?: "An error occurred during registration")
        }
    }

    fun logout() {
        sessionManager.clearSession()
        // Supabase sign out is async but we just clear locally for simplicity in this MVP
    }
}
