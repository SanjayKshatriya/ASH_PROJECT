package com.agrismarthub.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agrismarthub.app.data.models.AIScan

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AIDetectionScreen(
    onBack: () -> Unit
) {
    // For demo purposes, we'll manage a mock state. In reality, ViewModel + CameraX handles this.
    var scanResult by remember { mutableStateOf<AIScan?>(null) }
    var isScanning by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI Crop Health Scan") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
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
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            
            // Image Preview Area
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(300.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                if (isScanning) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Analyzing Leaf Patterns...", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                } else if (scanResult == null) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.CameraAlt,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Position crop leaf clearly in frame",
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    // Mock image display
                    Text("🍅", fontSize = 100.sp)
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            if (scanResult == null && !isScanning) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Button(
                        onClick = { 
                            // Mocking the scan process
                            isScanning = true
                            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                                isScanning = false
                                scanResult = AIScan(
                                    diseaseName = "Tomato Early Blight",
                                    confidence = 94.2,
                                    healthScore = 45.0,
                                    severity = "High",
                                    medicine = "Chlorothalonil or Mancozeb fungicide",
                                    yieldLoss = "20-30%"
                                )
                            }, 2000)
                        },
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(vertical = 12.dp)
                    ) {
                        Icon(Icons.Default.CameraAlt, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Take Photo")
                    }
                    
                    OutlinedButton(
                        onClick = { /* TODO */ },
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(vertical = 12.dp)
                    ) {
                        Icon(Icons.Default.PhotoLibrary, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Gallery")
                    }
                }
            } else if (scanResult != null) {
                // Result Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(12.dp)
                                    .clip(RoundedCornerShape(50))
                                    .background(MaterialTheme.colorScheme.error)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Disease Detected",
                                color = MaterialTheme.colorScheme.error,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Text(
                            text = scanResult!!.diseaseName ?: "Unknown",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Confidence: ${scanResult!!.confidence}%",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        
                        Divider(modifier = Modifier.padding(vertical = 16.dp))
                        
                        Text("Recommended Action", fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = scanResult!!.medicine ?: "Consult an expert",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Severity", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(scanResult!!.severity ?: "Unknown", fontWeight = FontWeight.Medium, color = MaterialTheme.colorScheme.error)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("Est. Yield Loss", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(scanResult!!.yieldLoss ?: "Unknown", fontWeight = FontWeight.Medium)
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        Button(
                            onClick = { scanResult = null },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Scan Another Crop")
                        }
                    }
                }
            }
        }
    }
}
