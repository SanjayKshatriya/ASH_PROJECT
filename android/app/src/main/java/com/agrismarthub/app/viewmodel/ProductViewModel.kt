package com.agrismarthub.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.agrismarthub.app.data.models.Product
import com.agrismarthub.app.data.repository.ProductRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProductViewModel @Inject constructor(
    private val repository: ProductRepository
) : ViewModel() {

    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products: StateFlow<List<Product>> = _products.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        loadProducts()
    }

    fun loadProducts() {
        viewModelScope.launch {
            _isLoading.value = true
            _products.value = repository.getProducts()
            _isLoading.value = false
        }
    }

    fun search(query: String) {
        viewModelScope.launch {
            _isLoading.value = true
            if (query.isBlank()) {
                _products.value = repository.getProducts()
            } else {
                _products.value = repository.searchProducts(query)
            }
            _isLoading.value = false
        }
    }
}
