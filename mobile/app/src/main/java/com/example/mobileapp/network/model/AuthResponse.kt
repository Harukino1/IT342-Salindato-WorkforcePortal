package com.example.mobileapp.network.model

data class AuthResponse(
    val token: String,
    val userId: String?,
    val email: String?,
    val firstName: String?,
    val lastName: String?,
    val role: String?
)