package com.agrismarthub.app.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// ─── AUTH MODELS ─────────────────────────────────────────────────

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val mobile: String = "",
    val state: String = "",
    val role: String = "farmer"
)

@Serializable
data class AuthResponse(
    val success: Boolean = false,
    val token: String? = null,
    val user: User? = null,
    val error: String? = null
)

// ─── USER MODEL ──────────────────────────────────────────────────

@Serializable
data class User(
    val id: String = "",
    @SerialName("farmer_id") val farmerId: String? = null,
    val name: String = "",
    val email: String = "",
    val mobile: String? = null,
    val role: String = "farmer",
    val gender: String? = null,
    val state: String? = null,
    val district: String? = null,
    val address: String? = null,
    @SerialName("is_verified") val isVerified: Boolean = false,
    @SerialName("is_active") val isActive: Boolean = true,
    @SerialName("last_login") val lastLogin: String? = null,
    @SerialName("created_at") val createdAt: String? = null
) {
    val avatarInitials: String get() = name.split(" ")
        .take(2).joinToString("") { it.firstOrNull()?.toString() ?: "" }.uppercase()
}

// ─── FARM MODEL ───────────────────────────────────────────────────

@Serializable
data class Farm(
    val id: String = "",
    @SerialName("farmer_id") val farmerId: String = "",
    @SerialName("farm_name") val farmName: String = "",
    @SerialName("total_land") val totalLand: Double? = null,
    @SerialName("land_unit") val landUnit: String = "acres",
    @SerialName("soil_type") val soilType: String? = null,
    @SerialName("irrigation_type") val irrigationType: String? = null,
    @SerialName("primary_crop") val primaryCrop: String? = null,
    @SerialName("farming_type") val farmingType: String = "Traditional",
    val latitude: Double? = null,
    val longitude: Double? = null,
    @SerialName("is_organic") val isOrganic: Boolean = false
)

// ─── PRODUCT MODELS ───────────────────────────────────────────────

@Serializable
data class Product(
    val id: String = "",
    @SerialName("farmer_id") val farmerId: String = "",
    val name: String = "",
    val category: String = "",
    val variety: String? = null,
    val description: String? = null,
    val price: Double = 0.0,
    val unit: String = "kg",
    val quantity: Double = 0.0,
    @SerialName("min_order") val minOrder: Double = 1.0,
    @SerialName("quality_grade") val qualityGrade: String? = null,
    @SerialName("is_certified") val isCertified: Boolean = false,
    val images: List<String>? = null,
    @SerialName("harvest_date") val harvestDate: String? = null,
    @SerialName("is_organic") val isOrganic: Boolean = false,
    @SerialName("is_available") val isAvailable: Boolean = true,
    val views: Int = 0,
    @SerialName("created_at") val createdAt: String? = null
)

// ─── AI SCAN MODELS ───────────────────────────────────────────────

@Serializable
data class AIScan(
    val id: String = "",
    @SerialName("farmer_id") val farmerId: String = "",
    @SerialName("image_url") val imageUrl: String? = null,
    @SerialName("disease_name") val diseaseName: String? = null,
    val confidence: Double? = null,
    @SerialName("health_score") val healthScore: Double? = null,
    val severity: String? = null,
    @SerialName("affected_area") val affectedArea: String? = null,
    val medicine: String? = null,
    val fertilizer: String? = null,
    @SerialName("water_req") val waterReq: String? = null,
    @SerialName("yield_loss") val yieldLoss: String? = null,
    @SerialName("recovery_time") val recoveryTime: String? = null,
    @SerialName("future_risk") val futureRisk: String? = null,
    @SerialName("model_version") val modelVersion: String = "YOLOv8",
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class AIDetectResponse(
    val success: Boolean = false,
    val data: AIScan? = null,
    val error: String? = null
)

// ─── CERTIFICATE MODELS ────────────────────────────────────────────

@Serializable
data class Certificate(
    val id: String = "",
    @SerialName("cert_id") val certId: String = "",
    @SerialName("farmer_id") val farmerId: String = "",
    @SerialName("crop_name") val cropName: String? = null,
    @SerialName("crop_variety") val cropVariety: String? = null,
    @SerialName("harvest_date") val harvestDate: String? = null,
    @SerialName("quality_grade") val qualityGrade: String? = null,
    @SerialName("health_score") val healthScore: Double? = null,
    @SerialName("disease_status") val diseaseStatus: String? = null,
    @SerialName("ai_confidence") val aiConfidence: Double? = null,
    @SerialName("expert_notes") val expertNotes: String? = null,
    @SerialName("blockchain_id") val blockchainId: String? = null,
    @SerialName("qr_code_url") val qrCodeUrl: String? = null,
    @SerialName("pdf_url") val pdfUrl: String? = null,
    val status: String = "pending",
    @SerialName("issued_at") val issuedAt: String? = null,
    @SerialName("expires_at") val expiresAt: String? = null
)

// ─── ORDER MODELS ─────────────────────────────────────────────────

@Serializable
data class Order(
    val id: String = "",
    @SerialName("order_id") val orderId: String = "",
    @SerialName("buyer_id") val buyerId: String = "",
    @SerialName("farmer_id") val farmerId: String = "",
    @SerialName("product_id") val productId: String = "",
    val quantity: Double = 0.0,
    @SerialName("unit_price") val unitPrice: Double = 0.0,
    @SerialName("total_amount") val totalAmount: Double = 0.0,
    @SerialName("delivery_address") val deliveryAddress: String? = null,
    @SerialName("payment_method") val paymentMethod: String? = null,
    @SerialName("payment_status") val paymentStatus: String = "pending",
    @SerialName("order_status") val orderStatus: String = "placed",
    val notes: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

// ─── IOT MODELS ───────────────────────────────────────────────────

@Serializable
data class IotReading(
    val id: Long = 0,
    @SerialName("farm_id") val farmId: String = "",
    @SerialName("device_id") val deviceId: String? = null,
    val temperature: Double? = null,
    val humidity: Double? = null,
    @SerialName("soil_moisture") val soilMoisture: Double? = null,
    @SerialName("soil_ph") val soilPh: Double? = null,
    @SerialName("light_intensity") val lightIntensity: Double? = null,
    val rainfall: Double? = null,
    @SerialName("wind_speed") val windSpeed: Double? = null,
    @SerialName("water_tank") val waterTank: Double? = null,
    @SerialName("co2_level") val co2Level: Double? = null,
    @SerialName("air_quality") val airQuality: Double? = null,
    @SerialName("recorded_at") val recordedAt: String? = null
)

@Serializable
data class IotAlert(
    val id: String = "",
    @SerialName("farm_id") val farmId: String = "",
    @SerialName("sensor_name") val sensorName: String = "",
    @SerialName("sensor_value") val sensorValue: Double = 0.0,
    val threshold: Double = 0.0,
    @SerialName("alert_type") val alertType: String = "warning",
    val message: String = "",
    @SerialName("is_resolved") val isResolved: Boolean = false,
    @SerialName("created_at") val createdAt: String? = null
)

// ─── MARKET PRICE MODEL ───────────────────────────────────────────

@Serializable
data class MarketPrice(
    val id: String = "",
    @SerialName("crop_name") val cropName: String = "",
    val state: String? = null,
    val market: String? = null,
    val price: Double = 0.0,
    val unit: String = "quintal",
    @SerialName("change_pct") val changePct: Double? = null,
    @SerialName("recorded_date") val recordedDate: String? = null,
    val source: String? = null
)

// ─── COMMUNITY MODEL ──────────────────────────────────────────────

@Serializable
data class CommunityPost(
    val id: String = "",
    @SerialName("author_id") val authorId: String = "",
    val content: String = "",
    val images: List<String>? = null,
    val tags: List<String>? = null,
    val likes: Int = 0,
    @SerialName("replies_count") val repliesCount: Int = 0,
    @SerialName("is_expert_answer") val isExpertAnswer: Boolean = false,
    @SerialName("is_pinned") val isPinned: Boolean = false,
    @SerialName("created_at") val createdAt: String? = null
)

// ─── NOTIFICATION MODEL ───────────────────────────────────────────

@Serializable
data class Notification(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    val type: String = "",
    val title: String = "",
    val message: String = "",
    @SerialName("is_read") val isRead: Boolean = false,
    @SerialName("created_at") val createdAt: String? = null
)

// ─── API RESPONSE WRAPPERS ────────────────────────────────────────

@Serializable
data class ApiResponse<T>(
    val success: Boolean = false,
    val data: T? = null,
    val error: String? = null,
    val total: Int? = null
)

// ─── WEATHER MODELS ───────────────────────────────────────────────

data class WeatherData(
    val temperature: Double = 0.0,
    val condition: String = "",
    val humidity: Int = 0,
    val windSpeed: Double = 0.0,
    val rainfall: Double = 0.0,
    val uvIndex: Int = 0,
    val icon: String = "⛅"
)

// ─── LOCAL SESSION ────────────────────────────────────────────────

data class SessionUser(
    val id: String,
    val name: String,
    val email: String,
    val role: String,
    val token: String,
    val state: String = "",
    val mobile: String = ""
)
