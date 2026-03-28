package com.example.mobileapp

import android.content.Intent
import android.os.Bundle
import android.util.Patterns
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.mobileapp.network.RetrofitClient
import com.example.mobileapp.network.model.AuthRequest
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.google.gson.Gson
import com.example.mobileapp.network.model.ErrorResponse
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var emailLayout: TextInputLayout
    private lateinit var passwordLayout: TextInputLayout
    private lateinit var etEmail: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var btnLogin: MaterialButton
    private lateinit var tvForgotPassword: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        initializeViews()
        setupListeners()
    }

    private fun initializeViews() {
        emailLayout = findViewById(R.id.emailLayout)
        passwordLayout = findViewById(R.id.passwordLayout)
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        tvForgotPassword = findViewById(R.id.tvForgotPassword)
    }

    private fun setupListeners() {
        btnLogin.setOnClickListener {
            if (validateInputs()) {
                performLogin()
            }
        }

        tvForgotPassword.setOnClickListener {
            Toast.makeText(this, "Forgot Password Clicked", Toast.LENGTH_SHORT).show()
        }
    }

    private fun validateInputs(): Boolean {
        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString().trim()
        var isValid = true

        if (email.isEmpty()) {
            emailLayout.error = "Email is required"
            isValid = false
        } else if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            emailLayout.error = "Invalid email format"
            isValid = false
        } else {
            emailLayout.error = null
        }

        if (password.isEmpty()) {
            passwordLayout.error = "Password is required"
            isValid = false
        } else if (password.length < 6) {
            passwordLayout.error = "Password must be at least 6 characters"
            isValid = false
        } else {
            passwordLayout.error = null
        }

        return isValid
    }

    private fun performLogin() {
        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString().trim()

        // Disable button to prevent double-tap
        btnLogin.isEnabled = false

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.login(
                    AuthRequest(email = email, password = password)
                )

                if (response.isSuccessful) {
                    val authResponse = response.body()
                    val token = authResponse?.token

                    getSharedPreferences("app_prefs", MODE_PRIVATE)
                        .edit()
                        .putString("auth_token", token)
                        .apply()

                    Toast.makeText(this@LoginActivity, "Login Successful", Toast.LENGTH_SHORT).show()

                    startActivity(Intent(this@LoginActivity, DashboardActivity::class.java))
                    finish()

                } else {
                    // Parse the error body from the backend {"message": "..."}
                    val errorBody = response.errorBody()?.string()
                    val errorMessage = try {
                        Gson().fromJson(errorBody, ErrorResponse::class.java).message
                    } catch (e: Exception) {
                        "Invalid email or password"
                    }
                    Toast.makeText(this@LoginActivity, errorMessage, Toast.LENGTH_SHORT).show()
                }

            } catch (e: Exception) {
                // Network error (no connection, server down, etc.)
                Toast.makeText(
                    this@LoginActivity,
                    "Connection failed. Check your network.",
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                btnLogin.isEnabled = true
            }
        }
    }
}