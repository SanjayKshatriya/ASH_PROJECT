package com.agrismarthub.app.data

import com.agrismarthub.app.data.models.AIDetectResponse
import com.agrismarthub.app.data.models.ApiResponse
import com.agrismarthub.app.data.models.Certificate
import com.agrismarthub.app.data.models.Farm
import com.agrismarthub.app.data.models.MarketPrice
import com.agrismarthub.app.data.models.Order
import com.agrismarthub.app.data.models.Product
import okhttp3.MultipartBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * Retrofit Interface for AgroSmartHub Express Backend.
 * Most auth is handled by Supabase directly, but business logic goes here.
 */
interface ApiService {

    // ─── PRODUCTS ───
    @GET("products")
    suspend fun getProducts(
        @Query("category") category: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): ApiResponse<List<Product>>

    @GET("products/{id}")
    suspend fun getProductById(@Path("id") id: String): ApiResponse<Product>

    @POST("products")
    suspend fun createProduct(@Body product: Product): ApiResponse<Product>

    // ─── MARKET PRICES ───
    @GET("products/market/prices")
    suspend fun getMarketPrices(): ApiResponse<List<MarketPrice>>

    // ─── AI DETECTION ───
    @Multipart
    @POST("ai/detect")
    suspend fun detectCropDisease(
        @Part image: MultipartBody.Part,
        @Part("farmer_id") farmerId: okhttp3.RequestBody
    ): AIDetectResponse

    // ─── ORDERS ───
    @GET("orders")
    suspend fun getOrders(): ApiResponse<List<Order>>

    @POST("orders")
    suspend fun placeOrder(@Body order: Order): ApiResponse<Order>

    // ─── CERTIFICATES ───
    @GET("certificates")
    suspend fun getCertificates(): ApiResponse<List<Certificate>>

    // ─── FARMERS ───
    @GET("farmers/{id}")
    suspend fun getFarmerProfile(@Path("id") id: String): ApiResponse<Farm>
}
