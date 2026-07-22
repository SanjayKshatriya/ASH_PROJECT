package com.agrismarthub.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.agrismarthub.app.data.SessionManager
import com.agrismarthub.app.data.models.LoginRequest
import com.agrismarthub.app.data.models.RegisterRequest
import com.agrismarthub.app.data.models.SessionUser
import com.agrismarthub.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val sessionManager: SessionManager
) : ViewModel() {

    private val _currentUser = MutableStateFlow<SessionUser?>(sessionManager.getSession())
    val currentUser: StateFlow<SessionUser?> = _currentUser.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun isLoggedIn(): Boolean = sessionManager.isLoggedIn()

    fun login(request: LoginRequest, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            val response = authRepository.login(request)
            
            if (response.success && response.token != null) {
                _currentUser.value = sessionManager.getSession()
                onSuccess()
            } else {
                _error.value = response.error ?: "Login failed"
            }
            
            _isLoading.value = false
        }
    }

    fun register(request: RegisterRequest, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            val response = authRepository.register(request)
            
            if (response.success && response.token != null) {
                _currentUser.value = sessionManager.getSession()
                onSuccess()
            } else {
                _error.value = response.error ?: "Registration failed"
            }
            
            _isLoading.value = false
        }
    }

    fun logout() {
        authRepository.logout()
        _currentUser.value = null
    }
    
    fun clearError() {
        _error.value = null
    }
}
