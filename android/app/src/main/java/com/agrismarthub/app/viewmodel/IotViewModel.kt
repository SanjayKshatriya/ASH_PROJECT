package com.agrismarthub.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.agrismarthub.app.data.models.IotReading
import com.agrismarthub.app.data.repository.IotRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class IotViewModel @Inject constructor(
    private val repository: IotRepository
) : ViewModel() {

    private val _latestReading = MutableStateFlow<IotReading?>(null)
    val latestReading: StateFlow<IotReading?> = _latestReading.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    fun fetchLatestData(farmId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _latestReading.value = repository.getLatestReading(farmId)
            _isLoading.value = false
        }
    }
}
