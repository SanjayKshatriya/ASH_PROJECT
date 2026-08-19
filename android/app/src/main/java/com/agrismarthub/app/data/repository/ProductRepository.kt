package com.agrismarthub.app.data.repository

import com.agrismarthub.app.data.SupabaseClientProvider
import com.agrismarthub.app.data.models.Product
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProductRepository @Inject constructor() {
    private val supabase = SupabaseClientProvider.client

    suspend fun getProducts(): List<Product> = withContext(Dispatchers.IO) {
        try {
            supabase.postgrest["products"]
                .select()
                .decodeList<Product>()
        } catch (e: Exception) {
            emptyList()
        }
    }

    suspend fun searchProducts(query: String): List<Product> = withContext(Dispatchers.IO) {
        try {
            supabase.postgrest["products"]
                .select {
                    filter {
                        or {
                            ilike("name", "%$query%")
                            ilike("category", "%$query%")
                        }
                    }
                }
                .decodeList<Product>()
        } catch (e: Exception) {
            emptyList()
        }
    }
}
