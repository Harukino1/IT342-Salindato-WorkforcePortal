package com.example.mobileapp

import android.os.Bundle
import android.util.Patterns
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.mobileapp.network.RetrofitClient
import com.example.mobileapp.network.model.ErrorResponse
import com.example.mobileapp.network.model.UserRegistrationRequest
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.google.gson.Gson
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {

    private lateinit var emailLayout: TextInputLayout
    private lateinit var firstNameLayout: TextInputLayout
    private lateinit var lastNameLayout: TextInputLayout
    private lateinit var phoneLayout: TextInputLayout
    private lateinit var passwordLayout: TextInputLayout
    private lateinit var confirmPasswordLayout: TextInputLayout

    private lateinit var etEmail: TextInputEditText
    private lateinit var etFirstName: TextInputEditText
    private lateinit var etLastName: TextInputEditText
    private lateinit var etPhone: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var etConfirmPassword: TextInputEditText

    private lateinit var btnRegister: MaterialButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        initializeViews()
        setupListeners()
    }

    private fun initializeViews() {
        emailLayout = findViewById(R.id.emailLayout)
        firstNameLayout = findViewById(R.id.firstNameLayout)
        lastNameLayout = findViewById(R.id.lastNameLayout)
        phoneLayout = findViewById(R.id.phoneLayout)
        passwordLayout = findViewById(R.id.passwordLayout)
        confirmPasswordLayout = findViewById(R.id.confirmPasswordLayout)

        etEmail = findViewById(R.id.etEmail)
        etFirstName = findViewById(R.id.etFirstName)
        etLastName = findViewById(R.id.etLastName)
        etPhone = findViewById(R.id.etPhone)
        etPassword = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)

        btnRegister = findViewById(R.id.btnRegister)
    }

    private fun setupListeners() {
        btnRegister.setOnClickListener {
            if (validateInputs()) {
                performRegistration()
            }
        }
    }

    private fun validateInputs(): Boolean {
        val email = etEmail.text.toString().trim()
        val firstName = etFirstName.text.toString().trim()
        val lastName = etLastName.text.toString().trim()
        val phone = etPhone.text.toString().trim()
        val password = etPassword.text.toString().trim()
        val confirmPassword = etConfirmPassword.text.toString().trim()

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

        if (firstName.isEmpty()) {
            firstNameLayout.error = "First name is required"
            isValid = false
        } else {
            firstNameLayout.error = null
        }

        if (lastName.isEmpty()) {
            lastNameLayout.error = "Last name is required"
            isValid = false
        } else {
            lastNameLayout.error = null
        }

        if (phone.isEmpty()) {
            phoneLayout.error = "Phone number is required"
            isValid = false
        } else if (!Patterns.PHONE.matcher(phone).matches()) {
            phoneLayout.error = "Invalid phone number"
            isValid = false
        } else {
            phoneLayout.error = null
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

        if (confirmPassword.isEmpty()) {
            confirmPasswordLayout.error = "Please confirm password"
            isValid = false
        } else if (confirmPassword != password) {
            confirmPasswordLayout.error = "Passwords do not match"
            isValid = false
        } else {
            confirmPasswordLayout.error = null
        }

        return isValid
    }

    private fun performRegistration() {
        val email = etEmail.text.toString().trim()
        val firstName = etFirstName.text.toString().trim()
        val lastName = etLastName.text.toString().trim()
        val phone = etPhone.text.toString().trim()
        val password = etPassword.text.toString().trim()

        btnRegister.isEnabled = false

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.register(
                    UserRegistrationRequest(
                        email = email,
                        firstName = firstName,
                        lastName = lastName,
                        password = password,
                        phoneNumber = phone  // mapping phone → phoneNumber to match backend
                    )
                )

                if (response.isSuccessful) {
                    Toast.makeText(
                        this@RegisterActivity,
                        "Account created successfully!",
                        Toast.LENGTH_SHORT
                    ).show()

                    // Navigate back to login
                    finish()

                } else {
                    val errorBody = response.errorBody()?.string()
                    val errorMessage = try {
                        Gson().fromJson(errorBody, ErrorResponse::class.java).message
                    } catch (e: Exception) {
                        "Registration failed. Please try again."
                    }
                    Toast.makeText(this@RegisterActivity, errorMessage, Toast.LENGTH_SHORT).show()
                }

            } catch (e: Exception) {
                Toast.makeText(
                    this@RegisterActivity,
                    "Connection failed. Check your network.",
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                btnRegister.isEnabled = true
            }
        }
    }
}