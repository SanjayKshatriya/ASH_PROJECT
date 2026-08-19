package com.agrismarthub.app.data.repository

import com.agrismarthub.app.data.SupabaseClientProvider
import com.agrismarthub.app.data.models.IotReading
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class IotRepository @Inject constructor() {
    private val supabase = SupabaseClientProvider.client

    suspend fun getLatestReading(farmId: String): IotReading? = withContext(Dispatchers.IO) {
        try {
            supabase.postgrest["iot_readings"]
                .select {
                    filter { eq("farm_id", farmId) }
                    order("recorded_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                    limit(1)
                }
                .decodeSingleOrNull<IotReading>()
        } catch (e: Exception) {
            null
        }
    }
}
