package com.example.mobileapp.network.model

data class UserRegistrationRequest(
    val email: String,
    val firstName: String,
    val lastName: String,
    val password: String,
    val phoneNumber: String,
    val role: String = "CUSTOMER" // default role
)