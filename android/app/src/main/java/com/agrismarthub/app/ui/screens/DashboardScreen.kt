package com.agrismarthub.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agrismarthub.app.data.models.SessionUser
import com.agrismarthub.app.ui.navigation.Routes
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    user: SessionUser?,
    onLogout: () -> Unit,
    onNavigateToFeature: (String) -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Good ${getGreeting()},",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = user?.name?.split(" ")?.firstOrNull() ?: "User",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { onNavigateToFeature(Routes.NOTIFICATIONS) }) {
                        Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                    }
                    IconButton(onClick = onLogout) {
                        Icon(Icons.Default.Logout, contentDescription = "Logout")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                WeatherWidget(user)
            }

            item {
                Text(
                    text = "Quick Actions",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
                QuickActionsGrid(onNavigateToFeature)
            }

            item {
                Text(
                    text = "Recent Activity",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
                ActivityCard()
            }
            
            item { Spacer(modifier = Modifier.height(24.dp)) }
        }
    }
}

@Composable
fun WeatherWidget(user: SessionUser?) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(
            modifier = Modifier
                .padding(20.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "⛅",
                fontSize = 48.sp,
                modifier = Modifier.padding(end = 16.dp)
            )
            Column {
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = "28°C",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = " Partly Cloudy",
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(bottom = 4.dp, start = 8.dp)
                    )
                }
                Text(
                    text = "📍 ${user?.state?.takeIf { it.isNotBlank() } ?: "Coimbatore, Tamil Nadu"}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun QuickActionsGrid(onNavigateToFeature: (String) -> Unit) {
    val actions = listOf(
        Pair("Scan Crop", "🔬") to Routes.AI_DETECTION,
        Pair("IoT Monitor", "📡") to Routes.IOT_MONITOR,
        Pair("Marketplace", "🛒") to Routes.MARKETPLACE,
        Pair("Certificates", "🏅") to Routes.CERTIFICATES,
        Pair("Orders", "📦") to Routes.ORDERS
    )

    // A simple grid implementation
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        for (i in actions.indices step 2) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ActionCard(
                    title = actions[i].first.first,
                    icon = actions[i].first.second,
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigateToFeature(actions[i].second) }
                )
                if (i + 1 < actions.size) {
                    ActionCard(
                        title = actions[i+1].first.first,
                        icon = actions[i+1].first.second,
                        modifier = Modifier.weight(1f),
                        onClick = { onNavigateToFeature(actions[i+1].second) }
                    )
                } else {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActionCard(title: String, icon: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = modifier.height(90.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder(true)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = icon, fontSize = 24.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

@Composable
fun ActivityCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Text("📦")
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text("Order #ORD-8822 Placed", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                    Text("100kg Organic Tomato", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Divider(modifier = Modifier.padding(vertical = 12.dp), color = MaterialTheme.colorScheme.outlineVariant)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF0D9488).copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🏅")
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text("Certificate Approved", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                    Text("Quality Grade A verified", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

fun getGreeting(): String {
    val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    return when (hour) {
        in 0..11 -> "Morning"
        in 12..16 -> "Afternoon"
        else -> "Evening"
    }
}
