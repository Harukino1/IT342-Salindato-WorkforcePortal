package com.example.mobileapp

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

import androidx.lifecycle.lifecycleScope
import com.example.mobileapp.network.RetrofitClient
import kotlinx.coroutines.launch

class DashboardActivity : AppCompatActivity() {

    private lateinit var navDashboard: TextView
    private lateinit var navAttendance: TextView
    private lateinit var navSchedule: TextView
    private lateinit var navLeave: TextView
    private lateinit var navSettings: TextView
    private lateinit var navLogout: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        // Check if user is logged in
        val token = getSharedPreferences("app_prefs", MODE_PRIVATE)
            .getString("auth_token", null)

        if (token == null) {
            Toast.makeText(this, "Please login first", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        initializeViews()
        setupNavigation()
    }

    private fun initializeViews() {
        navDashboard = findViewById(R.id.navDashboard)
        navAttendance = findViewById(R.id.navAttendance)
        navSchedule = findViewById(R.id.navSchedule)
        navLeave = findViewById(R.id.navLeave)
        navSettings = findViewById(R.id.navSettings)
        navLogout = findViewById(R.id.navLogout)
    }

    private fun setupNavigation() {

        navDashboard.setOnClickListener {
            setActive(navDashboard)
            Toast.makeText(this, "Dashboard Selected", Toast.LENGTH_SHORT).show()
        }

        navAttendance.setOnClickListener {
            setActive(navAttendance)
            Toast.makeText(this, "Attendance Selected", Toast.LENGTH_SHORT).show()
        }

        navSchedule.setOnClickListener {
            setActive(navSchedule)
            Toast.makeText(this, "Schedule Selected", Toast.LENGTH_SHORT).show()
        }

        navLeave.setOnClickListener {
            setActive(navLeave)
            Toast.makeText(this, "Leave Selected", Toast.LENGTH_SHORT).show()
        }

        navSettings.setOnClickListener {
            setActive(navSettings)
            Toast.makeText(this, "Settings Selected", Toast.LENGTH_SHORT).show()
        }

        navLogout.setOnClickListener {
            logoutUser()
        }
    }

    private fun setActive(activeView: TextView) {

        val navItems = listOf(
            navDashboard,
            navAttendance,
            navSchedule,
            navLeave,
            navSettings
        )

        for (item in navItems) {
            item.setTextColor(resources.getColor(android.R.color.darker_gray))
            item.textSize = 14f
        }

        activeView.setTextColor(resources.getColor(R.color.purple_500))
        activeView.textSize = 15f
    }

    private fun logoutUser() {
        val token = getSharedPreferences("app_prefs", MODE_PRIVATE)
            .getString("auth_token", null)

        if (token == null) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        lifecycleScope.launch {
            try {
                RetrofitClient.apiService.logout("Bearer $token")
            } catch (e: Exception) {
                // If logout fails, then goes to a clear local session
            } finally {
                // Clear the saved token
                getSharedPreferences("app_prefs", MODE_PRIVATE)
                    .edit()
                    .remove("auth_token")
                    .apply()

                Toast.makeText(this@DashboardActivity, "Logged out", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this@DashboardActivity, LoginActivity::class.java))
                finish()
            }
        }
    }
}