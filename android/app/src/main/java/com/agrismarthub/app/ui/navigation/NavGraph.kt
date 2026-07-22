package com.agrismarthub.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.agrismarthub.app.ui.screens.DashboardScreen
import com.agrismarthub.app.ui.screens.LoginScreen
import com.agrismarthub.app.ui.screens.RegisterScreen
import com.agrismarthub.app.ui.screens.SplashScreen
import com.agrismarthub.app.viewmodel.AuthViewModel

object Routes {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val DASHBOARD = "dashboard"
    const val AI_DETECTION = "ai_detection"
    const val IOT_MONITOR = "iot_monitor"
    const val MARKETPLACE = "marketplace"
    const val CERTIFICATES = "certificates"
    const val ORDERS = "orders"
}

@Composable
fun AppNavGraph(
    navController: NavHostController = rememberNavController(),
    authViewModel: AuthViewModel
) {
    NavHost(
        navController = navController,
        startDestination = Routes.SPLASH
    ) {
        composable(Routes.SPLASH) {
            SplashScreen(
                onNavigateToLogin = {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.SPLASH) { inclusive = true }
                    }
                },
                onNavigateToDashboard = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.SPLASH) { inclusive = true }
                    }
                },
                authViewModel = authViewModel
            )
        }

        composable(Routes.LOGIN) {
            LoginScreen(
                onNavigateToRegister = {
                    navController.navigate(Routes.REGISTER)
                },
                onLoginSuccess = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                viewModel = authViewModel
            )
        }

        composable(Routes.REGISTER) {
            RegisterScreen(
                onNavigateToLogin = {
                    navController.navigateUp()
                },
                onRegisterSuccess = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                viewModel = authViewModel
            )
        }

        composable(Routes.DASHBOARD) {
            val user by authViewModel.currentUser.collectAsState()
            DashboardScreen(
                user = user,
                onLogout = {
                    authViewModel.logout()
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true } // Clear all
                    }
                },
                onNavigateToFeature = { route ->
                    navController.navigate(route)
                }
            )
        }
        
        composable(Routes.AI_DETECTION) {
            com.agrismarthub.app.ui.screens.AIDetectionScreen(
                onBack = { navController.navigateUp() }
            )
        }
        composable(Routes.IOT_MONITOR) {
            com.agrismarthub.app.ui.screens.IoTMonitorScreen(
                onBack = { navController.navigateUp() }
            )
        }
        composable(Routes.MARKETPLACE) {
            com.agrismarthub.app.ui.screens.MarketplaceScreen(
                onBack = { navController.navigateUp() }
            )
        }
        composable(Routes.CERTIFICATES) { /* TODO - Next Phase */ }
        composable(Routes.ORDERS) { /* TODO - Next Phase */ }
    }
}
