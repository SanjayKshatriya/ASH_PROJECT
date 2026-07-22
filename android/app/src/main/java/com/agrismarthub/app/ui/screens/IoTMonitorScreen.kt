package com.agrismarthub.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IoTMonitorScreen(
    onBack: () -> Unit
) {
    var isRefreshing by remember { mutableStateOf(false) }
    
    // Mock Sensor Data
    val sensors = listOf(
        SensorData("Temperature", "26.5", "°C", "🌡️", "Normal"),
        SensorData("Soil Moisture", "42", "%", "💧", "Good"),
        SensorData("Humidity", "65", "%", "☁️", "Normal"),
        SensorData("Soil pH", "6.8", "pH", "⚗️", "Optimal"),
        SensorData("Light", "850", "Lux", "☀️", "High"),
        SensorData("Water Tank", "80", "%", "🛢️", "Full")
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("IoT Farm Monitor") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { 
                        isRefreshing = true 
                        // Simulate network call
                    }) {
                        if (isRefreshing) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = MaterialTheme.colorScheme.onSurface,
                                strokeWidth = 2.dp
                            )
                            // Simulate end of refresh
                            LaunchedEffect(Unit) {
                                delay(1000)
                                isRefreshing = false
                            }
                        } else {
                            Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            
            // Connection Status
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("🟢", fontSize = 20.sp)
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("Sensors Connected", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimaryContainer)
                        Text("Last updated: Just now", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onPrimaryContainer)
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            Text("Live Readings", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(16.dp))
            
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(sensors) { sensor ->
                    SensorCard(sensor)
                }
            }
        }
    }
}

@Composable
fun SensorCard(sensor: SensorData) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder(true),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(sensor.icon, fontSize = 24.sp)
                Text(
                    text = sensor.status, 
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(sensor.name, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Row(verticalAlignment = Alignment.Bottom) {
                Text(sensor.value, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text(" ${sensor.unit}", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(bottom = 4.dp))
            }
        }
    }
}

data class SensorData(val name: String, val value: String, val unit: String, val icon: String, val status: String)
